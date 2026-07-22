import { DurableObject } from 'cloudflare:workers';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    const match = url.pathname.match(/^\/room\/(\d{6})$/);
    if (!match) return json({ ok: true, service: 'Pinyin Kingdom PK' });
    const id = env.PK_ROOMS.idFromName(match[1]);
    return env.PK_ROOMS.get(id).fetch(request);
  }
};

export class PKRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.room = null;
    this.state = { players: {}, status: 'lobby', index: -1, questions: [], endsAt: 0 };
  }

  async ensureLoaded() {
    if (this.loaded) return;
    this.loaded = true;
    const saved = await this.ctx.storage.get('state');
    if (saved) this.state = saved;
  }

  async fetch(request) {
    await this.ensureLoaded();
    const url = new URL(request.url);
    this.room = url.pathname.split('/').pop();
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket required', { status: 426, headers: corsHeaders() });

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const id = crypto.randomUUID();
    const name = cleanName(url.searchParams.get('name'));
    const wantsHost = url.searchParams.get('host') === '1';
    const hasHost = Object.values(this.state.players).some(p => p.host);
    const player = { id, name, host: wantsHost && !hasHost, ready: false, score: 0, answered: false, joinedAt: Date.now() };

    this.state.players[id] = player;
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ id });
    await this.save();

    server.send(JSON.stringify({ type: 'welcome', id, room: this.room, isHost: player.host }));
    this.broadcastState();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    await this.ensureLoaded();
    const attachment = ws.deserializeAttachment();
    const id = attachment?.id;
    const player = this.state.players[id];
    if (!player) return;
    let data;
    try { data = JSON.parse(message); } catch { return; }

    if (data.type === 'ready' && this.state.status === 'lobby') {
      player.ready = !player.ready;
      await this.save();
      this.broadcastState();
      return;
    }

    if (data.type === 'start') {
      if (!player.host) return this.send(ws, { type: 'error', message: '只有老师可以开始比赛。' });
      const players = Object.values(this.state.players);
      if (players.length < 2) return this.send(ws, { type: 'error', message: '至少需要2位学生才能PK。' });
      if (!players.every(p => p.host || p.ready)) return this.send(ws, { type: 'error', message: '还有学生没有准备好。' });
      this.state.questions = Array.isArray(data.questions) ? data.questions.slice(0, 20) : [];
      this.state.status = 'playing';
      this.state.index = -1;
      for (const p of players) { p.score = 0; p.answered = false; }
      await this.nextQuestion();
      return;
    }

    if (data.type === 'answer' && this.state.status === 'playing') {
      if (player.answered) return;
      player.answered = true;
      const q = this.state.questions[this.state.index];
      const correct = data.choice === q.a;
      const remaining = Math.max(0, this.state.endsAt - Date.now());
      const speedBonus = correct ? Math.ceil(remaining / 1000) : 0;
      if (correct) player.score += 10 + speedBonus;
      this.send(ws, { type: 'answerResult', correct, answer: q.a, choice: data.choice });
      await this.save();
      this.broadcastState();
      if (Object.values(this.state.players).every(p => p.answered)) await this.nextQuestionSoon();
      return;
    }

    if (data.type === 'reset' && player.host) {
      this.state.status = 'lobby';
      this.state.index = -1;
      this.state.questions = [];
      for (const p of Object.values(this.state.players)) { p.ready = false; p.answered = false; p.score = 0; }
      await this.save();
      this.broadcastState();
    }
  }

  async webSocketClose(ws) {
    await this.removeSocket(ws);
  }

  async webSocketError(ws) {
    await this.removeSocket(ws);
  }

  async removeSocket(ws) {
    await this.ensureLoaded();
    const id = ws.deserializeAttachment()?.id;
    const wasHost = this.state.players[id]?.host;
    delete this.state.players[id];
    if (wasHost) {
      const next = Object.values(this.state.players).sort((a,b) => a.joinedAt - b.joinedAt)[0];
      if (next) next.host = true;
    }
    await this.save();
    this.broadcastState();
  }

  async nextQuestionSoon() {
    if (this.pending) return;
    this.pending = true;
    await new Promise(r => setTimeout(r, 1200));
    this.pending = false;
    if (this.state.status === 'playing') await this.nextQuestion();
  }

  async nextQuestion() {
    this.state.index += 1;
    if (this.state.index >= this.state.questions.length) {
      this.state.status = 'finished';
      await this.save();
      this.broadcast({ type: 'finished', players: publicPlayers(this.state.players) });
      return;
    }
    for (const p of Object.values(this.state.players)) p.answered = false;
    this.state.endsAt = Date.now() + 10000;
    const q = this.state.questions[this.state.index];
    await this.save();
    this.broadcast({ type: 'question', index: this.state.index, question: { q: q.q, c: q.c }, endsAt: this.state.endsAt });
    this.ctx.storage.setAlarm(this.state.endsAt);
  }

  async alarm() {
    await this.ensureLoaded();
    if (this.state.status !== 'playing') return;
    const q = this.state.questions[this.state.index];
    for (const ws of this.ctx.getWebSockets()) {
      const id = ws.deserializeAttachment()?.id;
      const p = this.state.players[id];
      if (p && !p.answered) this.send(ws, { type: 'answerResult', correct: false, answer: q.a, choice: '' });
    }
    await this.nextQuestionSoon();
  }

  broadcastState() { this.broadcast({ type: 'state', players: publicPlayers(this.state.players), status: this.state.status }); }
  broadcast(payload) { const msg = JSON.stringify(payload); for (const ws of this.ctx.getWebSockets()) { try { ws.send(msg); } catch {} } }
  send(ws, payload) { try { ws.send(JSON.stringify(payload)); } catch {} }
  async save() { await this.ctx.storage.put('state', this.state); }
}

function publicPlayers(players) {
  return Object.values(players).map(({ id, name, host, ready, score }) => ({ id, name, host, ready, score }));
}
function cleanName(value) { return String(value || '小勇士').replace(/[<>]/g, '').trim().slice(0, 12) || '小勇士'; }
function corsHeaders() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS' }; }
function json(data) { return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json;charset=UTF-8', ...corsHeaders() } }); }
