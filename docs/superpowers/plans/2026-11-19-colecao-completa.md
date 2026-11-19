# Coleção completa: plano de implementação

> **Para agentes:** sub-skill obrigatória: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam caixas (`- [ ]`) para acompanhar o progresso.

**Objetivo:** O site passa a listar tudo o que a versão 1.6 oferece em construções, animais, ferramentas, árvores e máquinas de produção, a sugerir quando vale a pena ter cada coisa e a ter um conferidor que compara as listas com a wiki.

**Arquitetura:** Tudo continua no `index.html` único. As listas ganham campos comuns (`en`, `col`, `step`, `listOnly`) e as sugestões passam por uma fila de coleção limitada a 1 por dia. Duas páginas novas, fora do app: `testes.html`, que carrega o app num iframe em modo teste e roda verificações, e `conferir.html`, que compara as listas com a wiki.

**Tecnologia:** HTML e JavaScript puros, sem build. Servidor local `python -m http.server 8765 --directory sh`, configurado como "stardew" em `.claude/launch.json` na pasta acima do repositório. Usa a API MediaWiki com `origin=*`.

**Projeto aprovado:** `docs/superpowers/specs/2026-11-19-colecao-completa-design.md`

## Restrições gerais

- Tudo no único `index.html`. As únicas páginas novas são `testes.html` e `conferir.html`. Nenhuma das duas tem link no app nem entra no cache do `sw.js`.
- Dados já salvos (`localStorage` `sdv-hoje-v1` e sincronização Firebase) continuam funcionando. O que não estiver marcado vale como padrão. Os campos novos precisam ter padrão em `normalize()`.
- Botões de toque com pelo menos 44px no celular. Use a classe `.it`, que já existe.
- Nomes em português iguais aos do jogo (wiki pt). Cada item novo tem `en` com o nome exato da wiki em inglês.
- O ouro não é controlado (`let budget=Infinity`). Nenhuma regra nova depende de ouro.
- Limites por dia:
  - Construções e máquinas de prioridade 1 e 2: continua o teto de **2** (`if(n>=2) break`).
  - Coleção (prioridade 3): no máximo **1 por dia**, e só se nenhuma sugestão de compra, construção ou melhoria de prioridade 1 ou 2 entrou no dia. Os passos de pré-requisito de itens de coleção contam nesse limite.
- **Não sugerir passos que dependem de sorteio diário** (quadro de pedidos do Pierre). Itens só disponíveis assim, ou só pela loja do Qi ou pelo Escritório de Campo, ficam como `listOnly`: aparecem na lista, mas nunca viram sugestão.
- **Exceção decidida com o dono: Pedidos Especiais.** Há um lembrete semanal, toda segunda, que persiste até ser marcado (Tarefa 3). As 3 máquinas de Pedido Especial têm a opção "Temos a receita".
- **Commits:** o dono só aceita commit quando pede. Nenhuma tarefa faz commit. Cada tarefa termina com `git diff --stat` como ponto de controle. O commit e o push acontecem na Tarefa 8, depois da revisão do subagente `equipe:revisor-codigo` e do OK do dono.
- Textos para o dono em português simples, no mesmo tom das tarefas atuais.

## Pontos de atenção na revisão

1. **Abrir `testes.html` no aparelho de verdade (GitHub Pages) não pode apagar a fazenda salva nem enviar dados de teste ao Firebase.** O modo teste não lê nem grava `localStorage` e não sincroniza. Teste na Tarefa 1.
2. **Dados salvos antigos, sem os campos novos** (`tools.trash`, `tools.pan`, `tools.scythe`, níveis de vara acima de 3, `owned` dos itens novos), carregam sem erro e com os padrões certos. Teste na Tarefa 1 (estado antigo) e na Tarefa 4.
3. **Dia com muitas coisas faltando** (fim de jogo, tudo como "Queremos") não pode encher o plano: 1 coleção no máximo e 2 construções no máximo. Teste na Tarefa 2.
4. **A wiki voltando vazia, bloqueada ou em outro formato** faz o conferidor mostrar erro, e nunca "tudo certo". Teste na Tarefa 7.
5. **Item "Não queremos"** nunca aparece em sugestão, nem como passo de pré-requisito. Teste na Tarefa 2 (construção) e na Tarefa 5 (animal).

---

### Tarefa 1: Página de testes e modo teste do app

**Arquivos:**
- Criar: `testes.html`
- Modificar: `index.html`, nos trechos de carregar e salvar o estado (`LS_KEY`, por volta da linha 948, e as funções de load/save/commit/sync)
- Modificar: `sw.js`, no handler `fetch`, para não guardar no cache `testes.html` nem `conferir.html`

**Interfaces:**
- Produz, no app: `window.MODO_TESTE`, que é `true` quando a URL tem `?teste=1`. Com ele, o carregamento começa de `normalize({example:false})` sem ler o `localStorage`, `commit()` não grava no `localStorage` e a sincronização Firebase não é iniciada nem envia nada.
- Produz, em `testes.html`:
  - `teste(nome, fn)`, que registra um teste. `fn(app)` pode ser assíncrona. `app` é o `contentWindow` do iframe `index.html?teste=1`.
  - `estado(app, patch)`, que aplica `patch` sobre um estado limpo (`app.eval('normalize')({example:false})` mais Object.assign profundo simples), põe em `app.eval('st')` com `st.frozen=null` e chama `commit()`.
  - `plano(app)`, que devolve a lista de tarefas do dia: as missões de cada jogador e as tarefas avulsas, achatadas em `[{id,t,d}]`, a partir de `app.eval('buildPlan')()`.
  - `ok(cond, msg)` e `igual(a, b, msg)`, que lançam erro com `msg` quando falham.
  - O resultado aparece na página como uma linha por teste ("ok"/"FALHA: msg") e um total "N de M ok" num elemento `#total`.

- [ ] **Passo 1: Criar `testes.html` com o executor e estes testes:**
  - `modo teste não toca no localStorage`: grava `localStorage['sdv-hoje-v1']='SENTINELA'` antes de abrir o iframe, roda `estado()` e `commit()` e confere que o valor continua `'SENTINELA'`. No fim, restaura o valor original.
  - `modo teste não sincroniza`: confere que nenhuma chamada de rede para `firestore`/`firebase` aconteceu. Use `performance.getEntriesByType('resource')` do iframe.
  - `estado antigo carrega`: chama `normalize({players:[{tools:{rod:3}},{}], owned:{silo:'have'}})` e confere que não lança erro e que `players[0].tools.rod===3`.
  - `plano de base gera tarefas`: com `estado(app,{year:1,season:0,day:5})`, `plano(app).length>0`.
- [ ] **Passo 2: Abrir `http://localhost:8765/testes.html` (preview "stardew") e ver os 2 primeiros testes falharem**, porque o modo teste ainda não existe.
- [ ] **Passo 3: Implementar `MODO_TESTE` no `index.html`**, com o desvio no carregamento, no `commit()` e no início da sincronização. No `sw.js`, não guardar no cache respostas cujo caminho termine em `testes.html` ou `conferir.html`.
- [ ] **Passo 4: Recarregar `testes.html`:** esperado "4 de 4 ok" e console sem erros. Abrir `index.html` normal e confirmar que ele continua salvando: mude o dia, recarregue e veja que o dia foi mantido.
- [ ] **Passo 5: Ponto de controle:** `git diff --stat` mostra `index.html`, `sw.js` e `testes.html`.

### Tarefa 2: Construções completas e fila de coleção

**Arquivos:**
- Modificar: `index.html`, em `BUILD` (linha ~680), no laço de construções dentro de `buildPlan` (linhas ~1470-1492) e na seção `sec('build',...)` de `renderForm` (linha ~2064)
- Teste: `testes.html`

**Interfaces:**
- Consome, da Tarefa 1: `teste`, `estado`, `plano`, `ok`, `igual`.
- Produz:
  - Campos novos opcionais em itens de `BUILD`:
    - `wizard:1`: encomendado ao Feiticeiro, com a mesma regra de obra que `robin` usa para `robinUntil`, mas com o campo próprio `wizardUntil`.
    - `col:1`: prioridade 3, só coleção.
    - `listOnly:1`: nunca vira sugestão.
    - `step:()=>({id,t,d})|null`: passo de pré-requisito, sugerido quando `ok()` é falso e o passo é possível hoje.
  - Fila de coleção dentro de `buildPlan`:
    - `const colCands=[]`.
    - `addCol(task)` coloca na fila uma tarefa já montada com `T(...)`, com id começando por `col-`.
    - `flushCol(tasks, houvePrioridade)` faz `tasks.push(colCands[0])` só se `!houvePrioridade && colCands.length`.
    - `houvePrioridade` é verdadeiro se alguma tarefa com id começando por `build-`, `animal-`, `tree-`, `upg-`, `pack`, `rod`, `tool-` entrou no dia.
    - Chame `flushCol` uma vez, depois de todas as sugestões de compra das Tarefas 2 a 5.
  - `BUILD_COUNT()`: devolve `{have, total}` dos itens de `BUILD` que não são `coop`/`barn`. É usado no resumo da seção.

Itens novos em `BUILD` (preços e materiais lidos da wiki 1.6 em 2026-11-19):

| id | n | en | origem | g | materiais | regra |
|---|---|---|---|---|---|---|
| mill | Moinho | Mill | robin | 2500 | 150 madeira, 50 pedra, 4 tecido | prioridade 2 |
| well | Poço | Well | robin | 1000 | 75 pedra | col |
| hutch | Cabana de Gosmas | Slime Hutch | robin | 10000 | 500 pedra, 10 quartzo refinado, 1 barra de irídio | col; `ok`: `st.mine>=120` |
| petbowl | Tigela de animal | Pet Bowl | robin | 5000 | 25 madeira de lei | col |
| obEarth | Obelisco da Terra | Earth Obelisk | wizard | 500000 | 10 barras de irídio, 10 cristais de terra | col; `ok`: missão `goblin` feita |
| obWater | Obelisco da Água | Water Obelisk | wizard | 500000 | 5 barras de irídio, 10 amêijoas, 10 corais | col; `ok`: `goblin` |
| obDesert | Obelisco do Deserto | Desert Obelisk | wizard | 1000000 | 20 barras de irídio, 10 cocos, 10 frutos do cacto | col; `ok`: `goblin` e `unl.bus` |
| obIsland | Obelisco da Ilha | Island Obelisk | wizard | 1000000 | 10 barras de irídio, 10 dentes de dragão, 10 bananas | col; `ok`: `goblin` e `unl.island` |
| junimo | Cabana Junimo | Junimo Hut | wizard | 20000 | 200 pedra, 9 carambolas, 100 fibras | prioridade 2; `ok`: `goblin` |
| clock | Relógio Dourado | Gold Clock | wizard | 10000000 | nenhum | col; `ok`: `goblin` |

Antes de gravar, confira os materiais do Obelisco da Terra e os requisitos de cada construção do Feiticeiro na página *Wizard's Tower*. Use os nomes em português do jogo (conferidos na Tarefa 7). Para obeliscos e relógio, quando `goblin` ainda não foi feita, `step` sugere a missão Caminho bloqueado, que já existe em `QUESTS`, se ela estiver disponível.

Correção junto: Torneirinha `sk:['foraging',4]` e Carvoaria `sk:['foraging',2]`, conforme a wiki Crafting 1.6.

- [ ] **Passo 1: Escrever os testes:**
  - `moinho sugerido`: estado ano 2, primavera 10, com `owned` vazio. `plano` tem tarefa com id `build-mill`.
  - `coleção espera prioridade`: num estado em que `build-mill` aparece, nenhuma tarefa `col-` aparece.
  - `uma coleção por dia`: todos os itens de prioridade 2 marcados `have`, `quests.goblin=true` e `unl.island=true`. Exatamente 1 tarefa `col-`.
  - `nunca mais de 2 construções`: no mesmo estado, mas sem nada marcado. Conte tarefas `build-` ≤ 2.
  - `não queremos some`: `owned.clock='no'`. Nenhuma tarefa com id contendo `clock`.
  - `obelisco sem a missão`: `quests.goblin` ausente. Nenhum `build-obEarth`/`col-obEarth`.
  - `níveis corrigidos`: `BUILD.find(b=>b.id==='tapper').sk[1]===4` e `kiln` `===2`.
- [ ] **Passo 2: Rodar `testes.html` e ver os testes novos falharem.**
- [ ] **Passo 3: Implementar.** Coloque os itens da tabela em `BUILD`. No laço de construções, itens `col` vão para `addCol` em vez de `tasks.push`, com o título "Encomendar X ao Feiticeiro" ou "na Robin". Itens `listOnly` são ignorados. Implemente a fila, `flushCol` e `wizardUntil`. A obra do Feiticeiro leva 0 dias; confirme na wiki e registre no comentário. A seção mostra "X de Y" com `BUILD_COUNT()` e o rótulo "Feiticeiro" ao lado dos itens dele.
- [ ] **Passo 4: Rodar `testes.html`:** todos ok, console sem erros.
- [ ] **Passo 5: Ponto de controle:** `git diff --stat`.

### Tarefa 3: Máquinas de produção completas

**Arquivos:**
- Modificar: `index.html`, em `BUILD`
- Teste: `testes.html`

**Interfaces:**
- Consome, da Tarefa 2: campos `col`, `listOnly`, `step`, `addCol`.
- Produz: mais itens em `BUILD`, com o mesmo formato.

Máquinas novas (wiki Crafting 1.6, seções *Artisan Equipment* e *Refining Equipment*):

| id | n (pt do jogo) | en | receita | materiais | regra |
|---|---|---|---|---|---|
| cask | Barril de carvalho (confirmar o nome pt) | Cask | casa com porão (`farm.houseLv>=3`) | 20 madeira, 1 madeira de lei | prioridade 2 |
| smoker | Defumador de peixe (confirmar) | Fish Smoker | Peixaria, 10.000g | 10 madeira de lei, 1 geleia do mar, 1 geleia do rio, 1 geleia da caverna | prioridade 2 |
| dehydrator | Desidratador (confirmar) | Dehydrator | Pierre, 10.000g | 30 madeira, 2 argila, 1 quartzo de fogo | prioridade 2 |
| heavyFurnace | Fornalha Pesada (confirmar) | Heavy Furnace | Maestria de Mineração | 2 fornalhas, 3 barras de ferro, 50 pedra | col |
| solar | Painel Solar (confirmar) | Solar Panel | Pedido Especial (Caroline) | 10 quartzos refinados, 5 barras de ferro, 5 barras de ouro | prioridade 2 só com `recipe` (ver Pedidos Especiais) |
| slimeInc | Incubadora de Gosma (confirmar) | Slime Incubator | Combate 8 | 2 barras de irídio, 100 gosmas | col; `ok`: `own('hutch')` |
| ostrichInc | Incubadora de Avestruz (confirmar) | Ostrich Incubator | Coleção do Escritório de Campo da Ilha | — | listOnly |
| slimePress | Prensa de Ovo de Gosma (confirmar) | Slime Egg-Press | Combate 6 | 25 carvão, 1 quartzo de fogo, 1 conjunto de pilhas | col; `ok`: `own('hutch')` |
| heavyTapper | Torneirinha Pesada (confirmar) | Heavy Tapper | Sr. Qi, 20 gemas do Qi | — | listOnly |
| wormBin | Minhocário (confirmar) | Worm Bin | Pesca 4 | 15 madeira de lei, 1 barra de ouro, 1 barra de ferro, 50 fibras | prioridade 2 |
| wormBin2 | Minhocário de Luxo (confirmar) | Deluxe Worm Bin | Pesca 8 | 1 minhocário, 30 musgo | prioridade 2; `ok`: `own('wormBin')` |
| boneMill | Moedor de Ossos (confirmar) | Bone Mill | Pedido Especial (Gunther) | 10 fragmentos de osso, 3 argila, 20 pedra | prioridade 2 só com `recipe` |
| geodeCrusher | Esmagador de Geodos | Geode Crusher | Pedido Especial (Clint) | 2 barras de ouro, 50 pedra, 1 diamante | prioridade 2 só com `recipe` |
| mushLog | Tronco de Cogumelo | Mushroom Log | Coleta 4 | 10 madeira de lei, 10 musgo | prioridade 2 |
| baitMaker | Máquina de Iscas (confirmar) | Bait Maker | Pesca 6 | 3 barras de ferro, 3 corais, 1 ouriço-do-mar | prioridade 2 |

**Pedidos Especiais.** `solar`, `boneMill` e `geodeCrusher` deixam de ser `listOnly` e ganham `so:{pedido,quem,req}`:
- `geodeCrusher` (nome no jogo: **Esmagador de Geodos**): Patrulha da Caverna, Clint, derrotar 50 de um tipo de monstro (7 dias);
- `boneMill`: Fragmentos do Passado, Gunther, entregar 100 itens de osso no museu (7 dias);
- `solar`: Ingredientes da Ilha, Caroline, embarcar 100 de inhame-taro, gengibre ou abacaxi (28 dias), com `req:()=>st.unl.island`.

A regra:
- Em "Construções e máquinas", essas três têm uma 4ª opção no `select`: `recipe` ("Temos a receita"). Com `owned[id]==='recipe'`, a máquina é sugerida para fabricar como prioridade 2. Antes disso, nunca é sugerida.
- Estado novo `st.soSeen` (número, padrão `-1` em `normalize`): o `absDay` da segunda-feira cujo quadro já foi visto.
- Em `buildPlan`, seja `mon` o `absDay` da segunda-feira da semana atual (`now - c.wd`). A tarefa `so-board` aparece quando todas estas condições valem:
  - a data é outono 2 do ano 1 ou depois;
  - `st.soSeen < mon`;
  - há pelo menos um pedido pendente: máquina sem `have`/`recipe`/`no` e `req` ok.
- Título: "Olhar o quadro de Pedidos Especiais (em frente à Mansão do Prefeito)". Detalhe: "Se aparecer um destes, aceitem: " e a lista "Pedido (Quem): o que pede, prazo, dá a receita de Máquina". Depois: "O quadro muda toda segunda; o prazo começa a contar na segunda."
- Marcar a tarefa aplica `fx:{set:[['soSeen',mon]]}`. Ela não entra no limite de coleção, nem no `houvePrioridade`, nem em `fullDay`. Em dia de festival que ocupa o dia, ela fica para o dia seguinte, porque persiste.

"Confirmar" quer dizer: pegue o nome do jogo pela wiki pt (langlink da página em inglês) antes de gravar. A receita que vem de loja (`smoker`, `dehydrator`) vira a sugestão "Comprar a receita de X na Peixaria/no Pierre (10.000g)" e depois "Fazer X". Itens de Maestria têm `step` quando os cinco níveis de habilidade de algum jogador chegam a 10: "Abrir a Caverna da Maestria e pegar a maestria de Mineração".

- [ ] **Passo 1: Escrever os testes:**
  - `minhocário com pesca 4`: jogador 0 com `fishing:4`. Aparece `build-wormBin`.
  - `sem pesca 4 não aparece`: os dois jogadores com `fishing:3`. Não aparece.
  - `qi e escritório nunca sugeridos`: tudo liberado. Nenhuma tarefa com id contendo `ostrichInc` ou `heavyTapper`.
  - `quadro na segunda`: ano 1, outono 8 (segunda), `soSeen:-1`. Aparece `so-board`, com "Patrulha da Caverna" e "Fragmentos do Passado" e sem "Ingredientes da Ilha". Com `unl.island:true`, aparece também "Ingredientes da Ilha".
  - `quadro persiste`: mesmo estado no outono 10 (quarta), sem marcar. `so-board` continua aparecendo.
  - `quadro marcado some até a próxima segunda`: no outono 10, `soSeen` igual ao `absDay` do outono 8. Não aparece. No outono 15 (segunda), aparece de novo.
  - `antes do outono 2 não aparece`: ano 1, verão 8. Sem `so-board`.
  - `receita libera a máquina`: `owned.geodeCrusher='recipe'`. "Patrulha da Caverna" some da lista e aparece `build-geodeCrusher`. Sem `recipe`, nunca aparece `build-geodeCrusher`.
  - `sem pedidos pendentes não aparece`: as três com `recipe` ou `no`. Sem `so-board`.
  - `barril de carvalho só com porão`: `farm.houseLv:2` não mostra `cask`; `houseLv:3` mostra.
  - `máquinas da wiki todas no catálogo`: confira que estes `en` existem em `BUILD`: Mayonnaise Machine, Bee House, Preserves Jar, Cheese Press, Loom, Keg, Oil Maker, Cask, Fish Smoker, Dehydrator, Charcoal Kiln, Crystalarium, Heavy Furnace, Lightning Rod, Solar Panel, Recycling Machine, Seed Maker, Slime Incubator, Ostrich Incubator, Slime Egg-Press, Tapper, Heavy Tapper, Worm Bin, Deluxe Worm Bin, Bone Mill, Geode Crusher, Mushroom Log, Bait Maker. A Fornalha conta pelo `farm.furnace`, que já existe. Não duplique.
- [ ] **Passo 2: Rodar e ver falhar.**
- [ ] **Passo 3: Implementar os itens e a regra de receita de loja.**
- [ ] **Passo 4: Rodar:** todos ok.
- [ ] **Passo 5: Ponto de controle:** `git diff --stat`.

### Tarefa 4: Ferramentas até a melhor versão

**Arquivos:**
- Modificar: `index.html`, em `TOOLS`/`TOOL0` (linhas ~345-352), `normalize()` (padrões das ferramentas novas), o bloco de melhorias no Clint (linhas ~1605-1630), as compras de vara em `fishMission` (linhas ~1754-1757) e a seção `eq`
- Teste: `testes.html`

**Interfaces:**
- Consome, da Tarefa 2: `addCol`, `flushCol`.
- Produz:
  - `TOOLS` ganha:
    - `['trash','Lata de lixo',LV]`;
    - `['pan','Bateia',['Nenhuma','Cobre','Aço','Ouro','Irídio']]`;
    - `['scythe','Foice',['Normal','Dourada','Irídio']]`.
  - A vara passa a ter `['Nenhuma','Vara de bambu','Fibra de vidro','Irídio','Irídio avançada']`, com nível 4 novo.
  - `TOOL0` ganha `trash:0, pan:0, scythe:0`.
  - `UPG_OF={trash:[[1000,'cobre'],[2500,'ferro'],[5000,'ouro'],[12500,'irídio']], pan:[null,[5000,'ferro'],[10000,'ouro'],[25000,'irídio']]}`. As ferramentas atuais continuam usando `UPG`.
  - `upgText(lv,k)` usa `UPG_OF[k]` quando existir.
  - `MASTERY_OPEN()`: verdadeiro se algum jogador tem os cinco níveis de habilidade em 10.

Regras (wiki Tools 1.6):
- **Lata de lixo:** melhoria no Clint, 2 dias, prioridade 3 (`col`). Nunca no lugar de uma melhoria de enxada/picareta/machado/regador.
- **Bateia de cobre:** o Willy entrega depois que a pedra brilhante da montanha sai, ou seja, com a sala do Aquário completa (`roomDone` da sala `fish`). É um passo `col`: "Falar com o Willy na peixaria para ganhar a bateia". Melhorias no Clint: prioridade 2 depois que o jogador tem a bateia.
- **Vara de irídio avançada:** 25.000g no Willy depois de pegar a maestria de Pesca. Com `MASTERY_OPEN()` e vara 3, vira passo `col` "Pegar a maestria de Pesca na Caverna da Maestria". Depois que o jogador marca a maestria (`players[i].pw.masteryFishing`, um chip novo em Poderes), vira sugestão de compra `rod4`, que mapeia para a loja `willy` em `shopOf`.
- **Foice dourada:** fim da Mina da Pedreira (precisa de `unl.quarry` e de ter passado do andar 100, `st.mine>=100`, condição de abertura da Mina da Pedreira; confirme na wiki). Passo `col`. **Foice de irídio:** maestria de Cultivo, com o chip `pw.masteryFarming`. Passo `col`.

**Short roxo do Lewis** (wiki 1.6, página *Secrets*):
- **`tool-shorts-<i>`**, prioridade 2, para cada jogador `i` com vara 4 e sem `players[i].pw.shortsRod`.
  - Título: "Pegar outro short roxo do Lewis e pôr na Vara de irídio avançada".
  - Detalhe: "Coloquem uma Escadaria (receita de Mineração 2: 99 pedras) no quarto do Lewis, na Mansão do Prefeito. Abre um porão com um labirinto e o short no fim. Ao pegar, um short amaldiçoado persegue vocês até a saída. No 1º espaço de apetrecho da vara avançada, o short faz o apetrecho do 2º espaço não gastar. A versão ornada com ouro não serve para isso."
  - Marcar aplica `fx:{set:[['players.<i>.pw.shortsRod',true]]}`.
  - Também vira chip em Poderes ("Short na vara"), para desmarcar.
- A versão ornada com ouro **não** vira sugestão (decisão do dono).

- [ ] **Passo 1: Escrever os testes:**
  - `estado antigo sem campos novos`: `normalize({players:[{tools:{rod:2}},{tools:{}}]})` dá `tools.trash===0`, `tools.pan===0` e `tools.scythe===0` para os dois.
  - `vara 4 só depois da maestria`: vara 3 e todos os níveis 10, sem o chip. Aparece passo `col-` de maestria e não aparece `rod4`. Com `pw.masteryFishing=true`, aparece `rod4` com "25.000g".
  - `lata de lixo é coleção`: um jogador com enxada 0. Nenhuma tarefa `upg-...-trash-...`.
  - `bateia depois do Aquário`: sala `fish` completa e `pan:0`. Aparece passo da bateia.
  - `short na vara avançada`: jogador 0 com vara 4 e sem `pw.shortsRod`. Aparece `tool-shorts-0` com "Escadaria". Com `pw.shortsRod=true`, some. Jogador com vara 3: não aparece.
  - `sem sugestão do short ornado`: em nenhum estado aparece tarefa com id contendo `shortsGold`.
  - `seção mostra 5 níveis de vara`: o `select` `t0-rod` tem 5 opções.
- [ ] **Passo 2: Rodar e ver falhar.**
- [ ] **Passo 3: Implementar.**
- [ ] **Passo 4: Rodar:** todos ok.
- [ ] **Passo 5: Ponto de controle:** `git diff --stat`.

### Tarefa 5: Animais, árvores e itens dos animais

**Arquivos:**
- Modificar: `index.html`, em `ANIMALS` (~734), `TREES` (~745), as sugestões de animais e árvores em `buildPlan` (linhas ~1665-1730) e a seção `anim`
- Teste: `testes.html`

**Interfaces:**
- Consome, da Tarefa 2: `addCol`, `col`, `step`, `listOnly`.
- Produz:
  - `ANIMALS` ganha `en` em todos os itens, `g:null` para os que não são vendidos e `step` para conseguir cada um.
  - `TREES` ganha `island:1` para banana e manga.
  - Itens de animais em `BUILD` com `marnie:1`/`joja:1` (sem obra): `pail`, `shears`, `heater`, `autoGrab` e `autoPet`.

Itens novos (confirme cada requisito na página *Animals* da wiki 1.6):

| id | n | en | como consegue | prédio | regra |
|---|---|---|---|---|---|
| chickenBlue | Galinha azul | Blue Chicken | evento de 8 corações da Shane; depois a Marnie vende | galinheiro | col |
| chickenVoid | Galinha do vazio | Void Chicken | ovo do vazio (Krobus) na incubadora | galinheiro grande | col; `step`: comprar ovo do vazio com o Krobus (`special.rusty`) |
| chickenGold | Galinha dourada | Golden Chicken | ovo de ouro (Sala das Nozes do Qi) na incubadora | galinheiro grande | col; `step` só com `unl.island` |
| dino | Dinossauro | Dinosaur | ovo de dinossauro (artefato) na incubadora | galinheiro grande | col; `step`: "conseguir um ovo de dinossauro" |
| ostrich | Avestruz | Ostrich | ovo de avestruz (ilha) na incubadora de avestruz | celeiro | col; `ok`: `own('ostrichInc')` |
| banana | banana | Banana | muda no comerciante da Ilha Gengibre | — | col; `ok`: `unl.island` |
| mango | manga | Mango | muda no comerciante da Ilha Gengibre | — | col; `ok`: `unl.island` |
| pail | Balde de leite | Milk Pail | Marnie, 1.000g | — | prioridade 2; `need`: vaca ou cabra |
| shears | Tesoura | Shears | Marnie, 1.000g | — | prioridade 2; `need`: ovelha |
| heater | Aquecedor | Heater | Marnie, 2.000g (também recompensa do conjunto Forragem) | — | col |
| autoGrab | Coletor automático (confirmar) | Auto-Grabber | Marnie, 25.000g, Cultivo 10 | — | prioridade 2 |
| autoPet | Acariciador automático (confirmar) | Auto-Petter | Mercado Joja, 50.000g | — | col |

A regra atual de animais (só sugerir o que cobre item do Centro Comunitário) continua para os 7 de hoje. Os que não cobrem nada do Centro e os novos passam a ser `col`.

- [ ] **Passo 1: Escrever os testes:**
  - `dinossauro vira passo`: `farm.coopLv:2` e sem `animals.dino`. Num dia sem outras prioridades, aparece `col-` com "ovo de dinossauro".
  - `dinossauro não queremos`: `owned['an-dino']='no'`. Nunca aparece. Use o padrão `owned['an-<id>']` para "não queremos" de animal e `animals.<id>` para "temos".
  - `banana só com a ilha`: `unl.island:false` não mostra; `true` mostra no dia livre.
  - `balde de leite com vaca`: `animals.cow:true` e sem `owned.pail`. Aparece `build-pail`.
  - `avestruz precisa da incubadora`: sem `owned.ostrichInc`, não aparece.
  - `seção conta animais`: o contador da seção mostra "N/12". São 7 de hoje mais 5 novos.
- [ ] **Passo 2: Rodar e ver falhar.**
- [ ] **Passo 3: Implementar.** Os chips de animal ganham 3 estados ("Queremos" / "Temos" / "Não queremos"), seguindo o padrão de 3 estados das missões (`qseg`), sem quebrar o `data-an` atual, em que um toque marca "temos".
- [ ] **Passo 4: Rodar:** todos ok.
- [ ] **Passo 5: Ponto de controle:** `git diff --stat`.

### Tarefa 6: Contadores e conferência do plano completo

**Arquivos:**
- Modificar: `index.html`, nos resumos das seções `eq`, `build` e `anim` (`renderForm`)
- Teste: `testes.html`

**Interfaces:**
- Consome: os catálogos das Tarefas 2 a 5.
- Produz: o resumo de cada seção no formato "X de Y", com Y vindo do tamanho do catálogo, sem número fixo no código. Em `eq`, conta ferramentas na melhor versão, por jogador: "Jogador 1: 3 de 9 no máximo".

- [ ] **Passo 1: Escrever os testes:**
  - `resumo de construções`: com 2 itens `have`, o resumo de `build` contém "2 de ".
  - `resumo de ferramentas`: jogador 0 com todas no máximo. Contém "9 de 9". As 9 são enxada, picareta, machado, regador, lata de lixo, vara, bateia, foice e mochila.
  - `regressão`: rodar de novo os testes das Tarefas 1 a 5 (o executor roda todos).
- [ ] **Passo 2: Rodar e ver falhar.**
- [ ] **Passo 3: Implementar.**
- [ ] **Passo 4: Rodar todos:** "N de N ok".
- [ ] **Passo 5: Conferir no celular.** No preview, `resize_window` preset mobile, aba Fazenda: as seções abrem, os botões têm altura ≥ 44px (medir com `getBoundingClientRect`) e não há rolagem horizontal.
- [ ] **Passo 6: Ponto de controle:** `git diff --stat`.

### Tarefa 7: Conferidor (`conferir.html`)

**Arquivos:**
- Criar: `conferir.html`
- Teste: o próprio `conferir.html` (modo `?simular=vazio`)

**Interfaces:**
- Consome: as listas do app, lidas por um iframe `index.html?teste=1` (modo teste da Tarefa 1) com `contentWindow.eval('BUILD')`, `ANIMALS`, `TREES` e `TOOLS`.
- Produz: uma página com uma seção por categoria. Cada seção tem três grupos (Falta no site / Só no site / Ok), uma tabela de nomes em português (site × jogo), a data e hora da conferência e as fontes usadas.

Fontes (API `https://stardewvalleywiki.com/mediawiki/api.php?action=parse&prop=text&format=json&origin=*&page=`):
- Construções: `Carpenter's_Shop` (tabela com coluna "Construction Time") e `Wizard's_Tower` (linhas com Obelisk, Junimo Hut e Gold Clock).
- Máquinas: `Crafting`, seções *Artisan Equipment* e *Refining Equipment* (segunda coluna de cada linha).
- Ferramentas: `Tools`, seções *Hoes*, *Pickaxes*, *Axes*, *Watering Cans*, *Trash Cans*, *Fishing Poles*, *Pans* e *Other Tools*.
- Animais: `Animals`, tabelas das seções *Chickens* a *Ostriches*.
- Árvores: `Fruit_Trees`, nomes terminados em "Sapling".
- Nomes em português: `action=query&prop=langlinks&lllang=pt&titles=...` na wiki em inglês, em lotes de 50.

Ignorados de propósito, numa lista `IGNORADOS` no topo do arquivo, cada um com o motivo:
- Cabin e Shipping Bin (construções que não são meta).
- Training Rod (não é degrau).
- Backpack inicial, Scythe inicial e Trash Can inicial (o jogador começa com eles).
- Cores de vaca.
- Farm Obelisk (fora do catálogo; decisão registrada no projeto).
- Gatos, cachorros, tartaruga e cavalo.

- [ ] **Passo 1: Escrever o modo de teste `?simular=vazio`:** com ele, cada busca devolve uma página sem tabelas. O esperado é a faixa vermelha "Erro: a fonte X voltou sem dados" em cada categoria e nenhuma linha "tudo certo".
- [ ] **Passo 2: Abrir `conferir.html?simular=vazio` e ver falhar** (a página ainda não existe ou não mostra o erro).
- [ ] **Passo 3: Implementar.** Também é erro (faixa vermelha) quando a busca falha (rede/Cloudflare), quando a resposta não é JSON ou quando uma categoria encontra menos de 3 itens.
- [ ] **Passo 4: Abrir `conferir.html?simular=vazio`:** erro visível em todas as categorias.
- [ ] **Passo 5: Abrir `conferir.html` de verdade:** "Falta no site" vazio em todas as categorias. Se não estiver, volte à tarefa da categoria e complete. A tabela de nomes em português não pode ter diferenças além das de maiúscula e do "Ovo grande (marrom/branco)".
- [ ] **Passo 6: Ponto de controle:** `git diff --stat`.

### Tarefa 8: Revisão final e envio

**Arquivos:** nenhum novo.

- [ ] **Passo 1: Rodar `testes.html`:** "N de N ok", console sem erros.
- [ ] **Passo 2: Rodar `conferir.html`:** nada em "Falta no site", nenhuma faixa de erro.
- [ ] **Passo 3: Rodar o subagente `equipe:revisor-codigo`** sobre o `git diff` e tratar o que ele apontar, conferindo cada ponto no código antes de mudar.
- [ ] **Passo 4: Mostrar ao dono o resumo do que mudou e pedir OK para commit e push.** Só com o OK:
  - `git add index.html sw.js testes.html conferir.html docs/`
  - commit com a mensagem "Coleção completa: construções, máquinas, ferramentas, animais e árvores da 1.6, com conferidor" e as linhas de atribuição da sessão;
  - `git push origin main`.
