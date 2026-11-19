# Coleção completa: tudo que o jogo oferece para ter

Data: 2026-11-19 · Versão do jogo: Stardew Valley 1.6 · Projeto: `index.html` (planejador "O Que Fazer Hoje em Stardew")

## Intenção e porquê

O dono joga em dupla (co-op) e quer fazer **100% do jogo**. Para ele, a graça é ter **pelo menos 1 de cada construção e de cada animal** e a **melhor versão de cada ferramenta**.

Hoje as listas do site ("Construções e máquinas", "Animais e árvores", "Equipamentos") foram montadas a partir do Centro Comunitário: cada coisa entrou porque ajuda a completar um conjunto. Por isso faltam itens que o jogo tem, como a Vara de irídio avançada, o avestruz, o dinossauro, o moinho e as construções do Feiticeiro. O dono notou e perdeu a confiança de que a lista esteja completa.

O que ele quer do site:
1. Que as listas tenham **tudo** o que existe nessas categorias na 1.6.
2. Que o site **sugira quando vale a pena** comprar, construir ou melhorar cada coisa, do mesmo jeito que já sugere o galinheiro, o pato ou a melhoria de ferramenta no Clint.
3. Uma forma de **garantir** que nada fique de fora, inclusive depois de atualizações do jogo.

## Metas

- Catálogo completo (1.6) nestas categorias:
  - **Construções da Robin:** celeiro, galinheiro e galpão com os níveis, casa e suas melhorias, silo, estábulo, lago de peixes, moinho, poço e cabana de gosmas. A tigela de animal de estimação também entra. Cabana (de jogador) e caixa de envio não entram: já existem ou não fazem sentido como meta.
  - **Construções do Feiticeiro:** Obelisco da Terra, da Água, do Deserto e da Ilha, Cabana Junimo e Relógio Dourado. O Obelisco da Fazenda não é construção: é um item da ilha (ver nota abaixo).
  - **Animais:** galinha (branca, marrom, azul, do vazio e dourada), pato, coelho, dinossauro, vaca, cabra, ovelha, porco e avestruz. As cores de vaca não entram, porque não mudam nada além da cor (decisão do construtor, ver abaixo).
  - **Ferramentas, por jogador.** Cada ferramenta é uma **escada**: ter a melhor versão conta como completo. O dado continua sendo um nível por ferramenta, como hoje em `players[i].tools`.
    - Até irídio: enxada, picareta, machado, regador e lata de lixo.
    - Vara: bambu, fibra de vidro, irídio e irídio avançada. A vara de treino fica fora, porque não é degrau da escada.
    - Bateia: cobre, aço, ouro e irídio.
    - Foice: normal, dourada e irídio.
    - Mochila: até a de luxo.
    - Balde de leite e tesoura entram como "ter ou não ter".
  - **Itens de construção animal:** aquecedor, coletor automático e acariciador automático.
  - **Árvores frutíferas:** as 6 atuais, mais banana e manga (Ilha Gengibre).
  - **Máquinas de produção:** todas as da categoria *Artisan Equipment* e *Refining Equipment* da página Crafting da wiki. Hoje são cerca de 30. **Vale a regra das seções.** A página foi lida em 2026-11-19, e minhocário, máquina de iscas e tronco de cogumelo estão dentro de *Refining Equipment*. Entram, por exemplo: tonel (Cask), defumador de peixe, desidratador, fornalha pesada, torneirinha pesada, painel solar, minhocário e minhocário de luxo, moedor de ossos, Esmagador de Geodos, tronco de cogumelo, máquina de iscas, incubadora de avestruz, incubadora de gosma e prensa de ovo de gosma.
- Sugestões de "quando vale a pena" para cada item novo, seguindo a mesma lógica que o site já usa (pré-requisitos, nível de habilidade, materiais, ouro disponível no orçamento do dia).
- Um **conferidor**: uma página separada no projeto que compara as listas do site com as listas da wiki e mostra o que falta ou sobra.
- Nomes em português **iguais aos do jogo**, seguindo a wiki em português (pt.stardewvalleywiki.com), como já foi feito com missões e itens.

## Fora desta etapa (vão para a etapa 2)

- Rastreador de Perfeição completo: embarcar todos os itens, todas as receitas de fabricação e de cozinha, todos os peixes, amizades, Fruta-estrela, nozes douradas, Matador de monstros.
- Fabricáveis que não são máquinas de produção: decoração, cercas, anéis, bombas, totens, iscas, apetrechos e baús.
- Conquistas (Steam) como base de sugestões.
- Pets extras (gato, cachorro, tartaruga), gosmas como animais e as variações de cor de vaca.

## O que seria um fracasso mesmo funcionando

- O plano do dia ficar poluído de sugestões de coleção, com obelisco, relógio dourado ou dinossauro aparecendo todo dia e empurrando para baixo o que importa naquele dia.
- Sugerir algo que ainda não dá para fazer: falta de receita, de desbloqueio ou de ouro.
- Gastar o ouro que o Centro Comunitário ou uma melhoria importante precisavam.
- O conferidor dizer "está tudo certo" quando não está, por exemplo porque a wiki mudou de formato e a leitura passou a voltar vazia sem avisar.

## Restrições

- Tudo continua num único `index.html`, sem build nem servidor. É assim que o projeto funciona (README). O conferidor é a única página nova.
- Dados salvos no navegador (`localStorage`) e sincronizados entre aparelhos (Firebase). Itens novos não podem quebrar dados já salvos: o que não estiver marcado vale como padrão.
- Precisa funcionar bem no celular (botões de toque de pelo menos 44px, como o resto).
- Sem `node` na máquina do dono. Os testes até agora rodaram no navegador embutido (servidor local `python -m http.server`).
- O app tem service worker (`sw.js`) com cache. O conferidor não deve entrar no cache do app nem aparecer no app do dia a dia.

## Abordagens consideradas

1. **Completar as listas à mão e conferir com a wiki uma vez.** É simples, mas a garantia vale só para hoje.
2. **Gerar as listas automaticamente a partir da wiki.** Nunca desatualiza, mas os nomes em português, as dicas e as regras de "quando vale a pena" continuam sendo feitos à mão. O programa automatizaria só a parte fácil e complicaria o projeto.
3. **Completar à mão e criar um conferidor (escolhida pelo dono).** A garantia continua valendo depois de atualizações e o app do dia a dia fica simples. Custa um pouco mais de trabalho agora.

Também ficou decidido com o dono: esta etapa cobre construções, animais, ferramentas, árvores e máquinas de produção. A Perfeição e as conquistas vêm depois, em cima desta base.

## Como as sugestões devem se comportar (decidido)

- **Pré-requisitos reais do jogo para cada item** (fonte: wiki 1.6). Exemplos:
  - Vara de irídio avançada: vendida pelo Willy a partir de um nível de Pesca. Confirmar na wiki.
  - Avestruz: precisa de ovo de avestruz (Ilha Gengibre) e incubadora de avestruz.
  - Dinossauro: ovo de dinossauro na incubadora do galinheiro grande.
  - Galinha azul: evento da Shane.
  - Galinha do vazio: ovo do vazio na incubadora.
  - Galinha dourada: ovo de ouro (Qi).
  - Obeliscos: Feiticeiro, depois da missão Caminho bloqueado.

  Sem o pré-requisito, nada de sugestão de compra. Se o pré-requisito for algo a fazer (por exemplo, conseguir o ovo), o site pode sugerir **esse passo**, se for claro e possível hoje.
- **De onde o site tira os pré-requisitos (decisão do construtor, sem caixas novas na tela):** do estado que já existe. Exemplos: missões marcadas como feitas (`quests`, como Caminho bloqueado), lugares liberados (`unl.island`, `unl.skull`...), andar da mina, ano e estação, níveis de habilidade e construções marcadas. O que o site não tem como saber vira a **sugestão do próprio passo**, sem campo novo. Por exemplo: "conseguir um ovo de dinossauro (artefato; achado cavando ou nas minas)". Quando o jogador marca o animal como "temos", o passo some.
- **O ouro não é controlado** (decisão já existente no código: `let budget=Infinity`). Por isso as regras de prioridade não dependem de ouro.
- **Ordem de prioridade entre sugestões de compra:**
  1. O que ajuda o Centro Comunitário (já existe).
  2. O que dá ouro ou tempo, ou destrava progresso (máquinas, aspersores, melhorias de ferramenta, estábulo...).
  3. O que é só para completar a coleção (obeliscos, relógio dourado, animais especiais).
- **Limites por dia:**
  - Prioridades 1 e 2: continua o teto atual de **2** construções ou máquinas por dia.
  - Prioridade 3 (coleção): no máximo **1 por dia**, e só quando **não houver nenhuma sugestão de compra ou construção** das prioridades 1 e 2 naquele dia.
  - Os **passos de pré-requisito** de itens de coleção, como conseguir o ovo, contam nesse limite de 1.
- **"Queremos / Já temos / Não queremos"** passa a valer para todos os itens do catálogo, como já vale para "Construções e máquinas". "Não queremos" tira o item das sugestões. O padrão continua sendo "Queremos", porque a meta é 100%.
- **Ferramentas são por jogador.** A meta é cada jogador chegar à melhor versão. As regras que já existem continuam valendo: o Clint fica com a ferramenta 2 dias e não se deixa a ferramenta lá no dia em que ela vai ser usada.
- **Short roxo do Lewis (decidido com o dono).** São duas coisas diferentes, segundo a wiki 1.6:
  - **O short normal é útil.** No 1º espaço de apetrecho da Vara de irídio avançada, impede que o apetrecho do 2º espaço se desgaste. Cópias extras saem de um porão secreto: coloca-se uma Escadaria no quarto do Lewis, na Mansão do Prefeito, e o short fica no fim de um labirinto. Pode ser repetido. O site sugere isso a cada jogador que tiver a vara avançada, até ele marcar.
  - **A versão ornada com ouro** (máquina de costura) **não entra**. O dono quer só a sugestão do short normal, que é o útil.
  - A wiki em português usa nomes trocados para os dois. Por isso o site descreve os shorts ("short roxo do Lewis", "versão ornada com ouro") em vez de usar um nome exato.
- **Contadores** "X de Y" em cada seção da aba Fazenda, para o dono ver quanto falta para completar.
- **Pedidos Especiais (decidido com o dono).** Três máquinas só vêm de receita ganha em Pedido Especial:

  | Máquina | Pedido | Quem pede | Requisito |
  |---|---|---|---|
  | Esmagador de Geodos | Patrulha da Caverna | Clint | — |
  | Moedor de Ossos | Fragmentos do Passado | Gunther | — |
  | Painel Solar | Ingredientes da Ilha | Caroline | Ilha Gengibre liberada |

  Como o quadro funciona (wiki 1.6): fica em frente à Mansão do Prefeito e aparece a partir do outono 2 do ano 1. Os pedidos mudam toda segunda, com duas opções por semana. O prazo é de 7 a 28 dias e começa a contar na segunda.

  O comportamento no site:
  - **Toda segunda**, a partir do outono 2 do ano 1, aparece a tarefa "Olhar o quadro de Pedidos Especiais (em frente à Mansão do Prefeito)". Ela lista os pedidos a aceitar se aparecerem: só os de máquinas sem receita e que não estão em "Não queremos".
  - **A tarefa persiste:** se ninguém marcar na segunda, ela continua nos dias seguintes. Quando alguém marca, ela some até a próxima segunda.
  - Cada uma dessas máquinas ganha a opção **"Temos a receita"**. Com ela marcada, o pedido sai da lista de segunda e a máquina passa a ser sugerida para fabricar (prioridade 2).
  - Sem nenhum pedido pendente, não aparece tarefa.
  - Essa tarefa **não entra** no limite de coleção. É um lembrete semanal e não é compra.

## O conferidor (decidido)

- É uma página separada no repositório (nome sugerido: `conferir.html`). O app não tem link para ela e ela não entra no cache do `sw.js`. Abre-se pelo endereço.
- Busca as listas na API da wiki em inglês (`stardewvalleywiki.com/mediawiki/api.php`, com `origin=*`, que funciona direto do navegador). Fontes:
  - Construções: página *Carpenter's Shop* e página *Wizard's Tower*.
  - Animais: página *Animals* e as tabelas de cada tipo.
  - Ferramentas: página *Tools* (seções de cada ferramenta).
  - Árvores: página *Fruit Trees*.
  - Máquinas: página *Crafting*, seções *Artisan Equipment* e *Refining Equipment*.
- Compara com as listas do site pelo **nome em inglês** (`en`), que cada item do catálogo passa a ter.
- Mostra três grupos:
  - **Falta no site:** está na wiki e não está no site.
  - **Só no site:** está no site e não está na wiki. Pode ser nome errado ou item removido.
  - **Ok.**
- Também confere o **nome em português** de cada item contra a wiki em português, pelos *langlinks* da wiki em inglês, como foi feito hoje com missões e itens.
- Se alguma fonte voltar vazia ou com formato inesperado, mostra **erro visível**, e nunca "tudo certo". Isso inclui o caso de a wiki bloquear o acesso. Em 2026-11-19, a API com `origin=*` funcionou várias vezes a partir do navegador, mas um acesso fora do navegador recebeu o desafio do Cloudflare.
- Mostra a data e hora da conferência e as fontes usadas.

## O que fica com o construtor

- Estrutura dos dados do catálogo dentro do `index.html`: reaproveitar `BUILD`, `LEVELED`, `ANIMALS`, `TREES` e `TOOLS` ou reorganizar. Precisa manter compatíveis os dados já salvos (`owned`, `animals`, `farm.*Lv`, `players[i].tools`).
- Textos de "por que vale a pena" de cada item (curtos, no tom do resto do site) e a ordem dos itens em cada seção.
- O formato exato de cada sugestão (título, detalhe, quem faz), seguindo os padrões das tarefas existentes.
- Como o conferidor lê as listas do site. Sugestão: carregar o `index.html` num `iframe` do mesmo endereço e ler as constantes, ou isolar os dados num bloco fácil de ler.
- **Obelisco da Fazenda:** não é construção da Robin nem do Feiticeiro (é comprado na ilha). Pode ficar no catálogo como item especial ou ficar fora. Registrar a escolha.
- **Melhorias da cabana do segundo jogador** (co-op): ficam fora desta etapa. A casa continua contada como uma só, a da fazenda. Decisão do construtor, que pode voltar na etapa 2.
- Cores de vaca e variações puramente visuais: fora, como dito acima. Se a wiki listar como animal separado, o conferidor deve aceitar isso como "ignorado de propósito", e não como "falta".
- Testes: roteiros no navegador como os usados até agora (cenários de estado, com conferência do plano gerado e do console sem erros), cobrindo pelo menos um item novo de cada categoria e o limite de 1 sugestão de coleção por dia.
