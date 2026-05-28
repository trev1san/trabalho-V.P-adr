// --- OUVINTE PRINCIPAL ---
// Garante que o navegador espere o HTML carregar totalmente antes de rodar o código JavaScript.
// Isso evita erros de "elemento não encontrado" (null).
document.addEventListener("DOMContentLoaded", function() {

    // ==========================================
    // 1. LÓGICA DO ÁUDIO (Para as páginas com Player)
    // ==========================================
    
    // Captura os elementos do HTML usando os seus respectivos IDs
    const audioDoc = document.getElementById("audio-doc");             // O elemento <audio> que toca o arquivo
    const btnSom = document.getElementById("btnsom");                 // O botão de Play/Pause
    const barraProgresso = document.getElementById("barra-progresso"); // A barra de arrastar (input do tipo range)
    const tempoAtual = document.getElementById("tempo-atual");         // O texto do cronômetro atual (ex: 0:00)
    const tempoTotal = document.getElementById("tempo-total");         // O texto do tempo final do áudio (ex: 3:45)

    // ESTRUTURA DE CONDICIONAL (IF): Só executa os códigos abaixo se TODOS esses elementos existirem na página atual.
    // Isso impede que o script quebre nas páginas que não possuem o áudio (como a page4.html).
    if (audioDoc && btnSom && barraProgresso && tempoAtual && tempoTotal) {
        
        // FUNÇÃO AUXILIAR: Transforma segundos puros em formato de minutos e segundos de relógio (ex: 75 -> "1:15")
        function formatarTempo(segundos) {
            if (isNaN(segundos)) return "0:00"; // Se não for um número válido, retorna o padrão zeroizado
            const min = Math.floor(segundos / 60); // Divide por 60 para descobrir os minutos inteiros
            const seg = Math.floor(segundos % 60);  // Pega o resto da divisão para descobrir os segundos restantes
            return `${min}:${seg < 10 ? '0' : ''}${seg}`; // Adiciona um "0" na esquerda se o segundo for menor que 10
        }

        // FUNÇÃO DE ATUALIZAÇÃO: Descobre o tamanho total do áudio e configura a barra de progresso
        function atualizarDuracao() {
            if (audioDoc.duration) {
                barraProgresso.max = audioDoc.duration; // Define o valor máximo que a barra de arrastar pode alcançar
                tempoTotal.innerText = formatarTempo(audioDoc.duration); // Escreve o tempo total formatado no HTML
            }
        }

        // GATILHOS DE CARREGAMENTO: Disparam a função 'atualizarDuracao' assim que o áudio carrega informações ou inicia
        audioDoc.onloadedmetadata = atualizarDuracao; // Dispara quando o navegador lê as informações básicas (metadados) do áudio
        audioDoc.onplay = atualizarDuracao;           // Dispara como garantia de segurança no momento em que o áudio começa a tocar
        
        // CACHE DE SEGURANÇA: Se o áudio já carregou muito rápido antes do script rodar (comum em arquivos salvos localmente)
        if (audioDoc.readyState >= 2) {
            atualizarDuracao(); // Força a atualização do tempo total imediatamente
        }

        // EVENTO DE CLIQUE (PLAY/PAUSE): Controla o comportamento do botão de som ao ser clicado
        btnSom.onclick = function() {
            if (audioDoc.paused) { // Se o áudio estiver pausado...
                audioDoc.play().catch(function(error) {
                    console.log("Erro ao reproduzir áudio:", error); // Evita travamentos caso o navegador bloqueie o autoplay
                });
                btnSom.innerText = "⏸ Pausar documentário"; // Muda o texto do botão para indicar pausa
                btnSom.style.backgroundColor = "#e74c3c";     // Altera a cor do botão para vermelho
            } else { // Se o áudio estiver tocando...
                audioDoc.pause(); // Pausa o som
                btnSom.innerText = "🔊 Ouvir documentário"; // Restaura o texto original do botão
                btnSom.style.backgroundColor = "#3498db";     // Restaura a cor original para azul
            }
        };

        // MONITORAMENTO DO TEMPO: Evento executado continuamente enquanto o arquivo de áudio está sendo tocado
        audioDoc.ontimeupdate = function() {
            // Se o navegador descobriu a duração real só agora, atualiza o limite máximo da barra
            if (barraProgresso.max !== audioDoc.duration) {
                atualizarDuracao();
            }
            barraProgresso.value = audioDoc.currentTime; // Faz a bolinha da barra avançar de acordo com o segundo atual do áudio
            tempoAtual.innerText = formatarTempo(audioDoc.currentTime); // Atualiza o cronômetro corrido na tela
        };

        // CONTROLE MANUAL (ARRASTAR A BARRA): Permite avançar ou voltar o áudio clicando/arrastando na barra azul
        barraProgresso.oninput = function() {
            audioDoc.currentTime = barraProgresso.value; // Move o ponto de reprodução do áudio para a posição que o usuário escolheu
            tempoAtual.innerText = formatarTempo(barraProgresso.value); // Atualiza o cronômetro em tempo real durante o arrasto
        };
    }

    // ==========================================
    // 2. LÓGICA DAS ESTATÍSTICAS (Para a page4.html)
    // ==========================================
    
    // MATRIZ DE DADOS (ARRAY): Guarda uma lista com o ID do HTML e o número final (alvo) que cada card deve alcançar
    const dadosContador = [
        { id: 'c1', alvo: 6416 }, // ID 'c1' vai contar até 6416
        { id: 'c2', alvo: 17   }, // ID 'c2' vai contar até 17
        { id: 'c3', alvo: 78   }, // ID 'c3' vai contar até 78
        { id: 'c4', alvo: 51   }, // ID 'c4' vai contar até 51
    ];

    // FUNÇÃO DE ANIMAÇÃO: Faz os números subirem de 0 até o alvo com efeito de aceleração suave
    function animarNumero(el, alvo) {
        const inicio = performance.now(); // Registra o milissegundo exato em que a animação começou
        
        // Procura apenas o nó de texto puro dentro da div. 
        // Isso impede que o código apague a tag <span>%</span> existente nos cards 3 e 4.
        const noTexto = Array.from(el.childNodes).find(node => node.nodeType === 3);

        // Função interna que roda repetidamente a cada frame da tela (aproximadamente 60 vezes por segundo)
        function passo(agora) {
            // Calcula o progresso do tempo. 1400 significa que a animação dura exatamente 1.4 segundos.
            const p = Math.min((agora - inicio) / 1400, 1);
            
            // FÓRMULA MATEMÁTICA (CUBIC EASING): Faz com que o número suba rápido no começo e desacelere no final
            const easing = 1 - Math.pow(1 - p, 3);
            
            // Calcula o valor atual e converte para o formato brasileiro (coloca pontos nos milhares, ex: 6.416)
            const valorFormatado = Math.round(easing * alvo).toLocaleString('pt-BR');
            
            // Insere o número calculado de volta na tela
            if (noTexto) {
                noTexto.nodeValue = valorFormatado; // Substitui apenas o texto numérico mantendo o símbolo de % intacto
            } else {
                el.innerText = valorFormatado;      // Substituição direta caso não haja tags internas
            }
            
            // Se o progresso (p) ainda não chegou a 1 (100%), pede para o navegador rodar o próximo frame
            if (p < 1) requestAnimationFrame(passo);
        }
        
        // Inicia o primeiro ciclo da animação de frames
        requestAnimationFrame(passo);
    }

    // FUNÇÃO DE DISPARO: Inicia a contagem de todos os cards de estatísticas da lista
    function iniciarContador() {
        dadosContador.forEach(function(item, i) {
            const elemento = document.getElementById(item.id); // Busca o card correspondente pelo ID
            if (elemento) {
                // Define um atraso em cascata (efeito dominó). O primeiro começa logo, os próximos atrasam 180ms entre si.
                setTimeout(() => animarNumero(elemento, item.alvo), i * 180);
            }
        });
    }

    // FUNÇÃO GLOBAL DO BOTÃO: Reseta os contadores para zero e reinicia a animação completa
    // 'window.' garante que o botão com 'onclick="reiniciarContador()"' do HTML consiga acionar essa função.
    window.reiniciarContador = function() {
        dadosContador.forEach(function(item) {
            const elemento = document.getElementById(item.id);
            if (elemento) {
                // Localiza o nó de texto e força ele de volta para zero
                const noTexto = Array.from(elemento.childNodes).find(node => node.nodeType === 3);
                if (noTexto) noTexto.nodeValue = '0';
            }
        });
        // Dá um intervalo mínimo de 80 milissegundos e reaciona a subida dos números
        setTimeout(iniciarContador, 80);
    };

    // SENSOR DE ROLAGEM DE TELA (Intersection Observer): Detecta quando a seção de estatísticas aparece na tela do usuário
    const secEstatisticas = document.getElementById('estatisticas');
    if (secEstatisticas) {
        const observer = new IntersectionObserver(function(entries) {
            // Se pelo menos 30% da seção estiver visível aos olhos do usuário...
            if (entries[0].isIntersecting) {
                iniciarContador(); // Roda a animação de contagem automática
                observer.disconnect(); // Desliga o sensor para a animação não ficar reiniciando toda hora que rolar a tela
            }
        }, { threshold: 0.3 }); // 0.3 representa 30% da área do elemento aparecendo na tela
        
        observer.observe(secEstatisticas); // Começa a vigiar a seção de estatísticas
    }
});
const images = document.querySelectorAll('.flashcard-image img');
const btn = document.getElementById('proximo');
const voltar = document.getElementById('voltar')

let current = 0;

function showImage(index) {
	images.forEach((img, i) => {
		img.style.display = i === index ? 'block' : 'none';
	});
}

if (images.length > 0) {
	showImage(current);
	//botao avançar
	btn.onclick = function(){
		current = (current + 1) % images.length;
		showImage(current);
	};
}
if (voltar) {
    voltar.onclick = function() {
        current = (current - 1 + images.length) % images.length;
        showImage(current);
    };
}
