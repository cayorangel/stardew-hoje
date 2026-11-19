# Desbloqueáveis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Toda recompensa única do quadro de Pedidos Especiais da cidade vira um item marcável e entra no lembrete de segunda; a seção vira "Desbloqueáveis" com categorias.

**Architecture:** Tudo em `index.html`. O catálogo `BUILD` ganha `cat` em todo item, `so` aceita lista, e há dois tipos novos (`item:1`, `uso:1`). O lembrete `so-board` e a seção `build` do formulário leem esses campos. Testes no navegador em `testes.html`.

**Tech Stack:** HTML/JS puro, sem build. Testes: abrir `testes.html` por um servidor local (`python -m http.server`) e ler a linha `TOTAL`.

**Spec:** `docs/superpowers/specs/2026-11-19-desbloqueaveis-design.md`

## Global Constraints
- Textos em português, no mesmo tom do app. Nomes e materiais exatamente como na tabela "Novos itens" do spec.
- Ids existentes de `BUILD` não mudam (os dados salvos dos jogadores continuam valendo).
- Commit só quando o usuário pedir (CLAUDE.md), depois do `equipe:revisor-codigo`.

## Review Focus
1. Itens `item:1` nunca podem gerar tarefa "Fazer X" nem "Comprar a receita" → teste em Task 1.
2. Item `uso:1` com 'recipe' conta como "temos" (contador e `wants`) → teste em Task 1.
3. Mini-Caixa de Envio com dois pedidos: só o do Lewis some no inverno → teste em Task 2.
4. Pedido de primavera não aparece no verão → teste em Task 2.
5. Itens já marcados ("have", "recipe") continuam com o mesmo valor depois da mudança → teste em Task 3 (o select mostra o valor salvo).

---

### Task 1: Catálogo (categorias, tipos, novos itens)

**Files:**
- Modify: `index.html` (`const BUILD=[…]`, ~689–739; `own()` ~934)
- Test: `testes.html` (depois do teste 'máquinas da wiki todas no catálogo')

**Interfaces:**
- Produces: `BUILD[i].cat` ∈ `'constr'|'maq'|'anim'|'pesca'|'util'|'deco'|'outros'`; `BUILD[i].item` (1 = chega pronto); `BUILD[i].uso` (1 = receita basta); `so` = objeto ou array de `{pedido,quem,o,dias,req?:(c)=>bool}`; `function soList(b): Array` (sempre array, vazio sem `so`); `const CATS=[[cat,'Título'],…]` na ordem da tabela do spec.

- [ ] **Step 1: testes que falham**
```js
teste('todo desbloqueável tem categoria', async app=>{
  const cats=app.eval('CATS').map(c=>c[0]);
  app.eval('BUILD').filter(b=>b.id!=='coop'&&b.id!=='barn').forEach(b=>ok(cats.includes(b.cat),'sem categoria: '+b.id));
});
teste('recompensas dos pedidos especiais no catálogo', async app=>{
  const en=new Set(app.eval('BUILD').map(b=>b.en));
  ['Stone Chest','Deluxe Red Double Bed','Farm Computer','Sewing Machine','Coffee Maker','Mini-Fridge','Mini-Shipping Bin','Fiber Seeds','Quality Bobber','Deluxe Fish Tank','Mini-Obelisk','Monster Musk','F.I.B.S. TV Channel'].forEach(n=>ok(en.has(n),'falta '+n));
});
teste('item pronto nunca vira tarefa de fazer', async app=>{
  fimDeJogo(app,{owned:{coffeeMaker:'want',miniFridge:'want',fishTank:'want',bedRed:'want',fibs:'want',sewing:'want',miniBin:'want'}});
  igual(ids(app,/^(build|col)-(coffeeMaker|miniFridge|fishTank|bedRed|fibs|sewing|miniBin)/).length,0,'apareceu');
});
teste('receita de uso conta como temos', async app=>{
  fimDeJogo(app,{owned:{musk:'recipe'}});
  ok(app.eval('own')('musk'),'own falso'); igual(ids(app,/musk/).length,0,'virou tarefa');
});
teste('baú de pedra: com a receita, fazer', async app=>{
  fimDeJogo(app,{owned:{stoneChest:'recipe'}});
  const t=tarefa(app,'build-stoneChest'); ok(t&&/Fazer baú de pedra/.test(t.t)&&/50 pedra/.test(t.d),'tarefa: '+(t&&t.t+' '+t.d));
});
```
- [ ] **Step 2:** abrir `http://localhost:8000/testes.html` → os 5 testes novos em FALHA, os antigos ok.
- [ ] **Step 3:** em `index.html`: definir `CATS` e `soList`; pôr `cat` em todos os itens; acrescentar os 13 itens com ids `stoneChest, bedRed, farmComputer, sewing, coffeeMaker, miniFridge, miniBin, fiberSeeds, bobber, fishTank, miniObelisk, musk, fibs` (dados da tabela do spec; `item:1` para bedRed, sewing, coffeeMaker, miniFridge, miniBin, fishTank, fibs; `uso:1` para fiberSeeds, bobber, musk); `own(id)` retorna true também quando o valor é 'recipe' e o item tem `uso`; no laço de construções (~1543) pular `b.item` e `b.uso`. Trocar o uso direto de `b.so.req` por `soList(b)`.
- [ ] **Step 4:** recarregar `testes.html` → `TOTAL: N de N — tudo ok`.

### Task 2: Lembrete de segunda com vários pedidos e condições

**Files:**
- Modify: `index.html` (bloco 'so-board', ~1568–1575)
- Test: `testes.html` (perto de `const SO=`)

**Interfaces:**
- Consumes: `soList(b)`, `b.item`, `b.uso` (Task 1). `req` recebe `c` (contexto do dia; `c.S` 0=primavera … 3=inverno).

- [ ] **Step 1: testes que falham**
```js
teste('quadro cita o baú de pedra', async app=>{
  fimDeJogo(app,{year:1,season:2,day:8,soSeen:-1,owned:{stoneChest:'want'}});
  const d=tarefa(app,'so-board').d; ok(/Corrida de Recursos/.test(d)&&/receita de Baú de Pedra/.test(d),d);
});
teste('quadro: pedidos de primavera só na primavera', async app=>{
  fimDeJogo(app,{year:2,season:1,day:1,soSeen:-1,owned:{coffeeMaker:'want',fibs:'want',stoneChest:'want'}});
  ok(!/Presentes para o George|Coisa Forte/.test(tarefa(app,'so-board').d),'apareceu no verão');
  ajusta(app,s=>{s.season=0;s.day=8;});
  ok(/Presentes para o George/.test(tarefa(app,'so-board').d)&&/Recompensa: Cafeteira/.test(tarefa(app,'so-board').d),'faltou na primavera');
});
teste('quadro: mini-caixa no inverno só pelo Pierre', async app=>{
  fimDeJogo(app,{year:2,season:3,day:1,soSeen:-1,owned:{miniBin:'want'}});
  const d=tarefa(app,'so-board').d; ok(/Produtos de Primeira/.test(d)&&!/Pedido de Colheita/.test(d),d);
});
teste('quadro: computador vem de dois pedidos', async app=>{
  fimDeJogo(app,{year:2,season:1,day:1,soSeen:-1,owned:{farmComputer:'want'}});
  const d=tarefa(app,'so-board').d; ok(/Superpopulação Aquática/.test(d)&&/Equilíbrio do Bioma/.test(d),d);
});
```
- [ ] **Step 2:** recarregar → os 4 em FALHA.
- [ ] **Step 3:** reescrever o bloco: `pend` = pares (item, pedido) de `soList(b)` com item em 'want' e `!p.req||p.req(c)`; texto por pedido: `${p.pedido} (${p.quem}): ${p.o}, prazo de ${p.dias} dias. Recompensa: ${b.item?b.n:'receita de '+b.n}`; final do texto: `marquem em Desbloqueáveis` ("Temos a receita" ou "Já temos").
- [ ] **Step 4:** recarregar → tudo ok (inclusive 'quadro na segunda' antigo).

### Task 3: Seção "Desbloqueáveis" com categorias

**Files:**
- Modify: `index.html` (seção 'build' em `renderForm`, ~2205–2210; comentário ~1541)
- Test: `testes.html`

**Interfaces:**
- Consumes: `CATS`, `b.cat`, `b.item`, `b.uso` (Task 1).

- [ ] **Step 1: testes que falham**
```js
teste('seção desbloqueáveis com categorias', async app=>{
  fimDeJogo(app); app.eval('render')();
  const s=app.document.querySelector('[data-sec="build"]'); ok(s&&/Desbloqueáveis/.test(s.querySelector('summary').textContent),'título');
  app.eval('CATS').forEach(([,t])=>ok(s.textContent.includes(t),'falta categoria '+t));
});
teste('opções por tipo', async app=>{
  fimDeJogo(app,{owned:{coffeeMaker:'want',musk:'recipe'}}); app.eval('render')();
  const v=id=>[...app.document.getElementById('b-'+id).options].map(o=>o.value).join(',');
  igual(v('coffeeMaker'),'want,have,no'); igual(v('musk'),'want,recipe,no'); igual(v('stoneChest'),'want,recipe,have,no');
  igual(app.document.getElementById('b-musk').value,'recipe','valor salvo');
});
```
- [ ] **Step 2:** recarregar → FALHA.
- [ ] **Step 3:** título 'Desbloqueáveis'; para cada `CATS`, subtítulo `<span class="flabel">Título <span class="muted">X de Y</span></span>` em coluna inteira e os selects dessa categoria; opções: `item` → want/have/no; `uso` → want/recipe/no; `so||shopRecipe` → want/recipe/have/no; demais → want/have/no. Texto de ajuda inalterado exceto o nome da seção.
- [ ] **Step 4:** recarregar → tudo ok; abrir `index.html`, conferir a seção no celular (375px) e no computador.
