// js/modules/contactForm.js
// - Feedback inline (sem redirecionar Formspree)
// - Validação forte: e-mail válido e mensagem não vazia (nem com espaços, NBSP, ou zero-width)
// - Contador de caracteres (padrão 2000, personalizável via maxlength/data-maxlength)
// - Honeypot anti-bot
// - Botão com estado de carregamento
// - Mensagens seguras (sem innerHTML com conteúdo externo)

export function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedbackDiv = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    // Campos usuais
    const emailEl = form.querySelector('input[type="email"], input[name="email"], #email');
    const msgEl = form.querySelector('textarea[name="message"], textarea#message, textarea');

    // Honeypot (anti-bot)
    const honeypot = form.querySelector('input[name="_gotcha"], #website');

    // Contador (agora ao lado do label) + helper que some ao digitar
    let counterEl = form.querySelector('#message-counter');
    const helperEl = form.querySelector('#message-helper');

    const maxLen =
        Number((msgEl && (msgEl.getAttribute('maxlength') || msgEl.dataset.maxlength))) || 2000;

    if (msgEl) {
        if (!msgEl.hasAttribute('maxlength')) msgEl.setAttribute('maxlength', String(maxLen));

        // Se não existir #message-counter no HTML, cria e coloca no cabeçalho do label
        if (!counterEl) {
            counterEl = document.createElement('span');
            counterEl.id = 'message-counter';
            counterEl.className = 'text-xs text-gray-400';
            const header = form.querySelector('[data-message-header]') || msgEl.parentElement;
            header.appendChild(counterEl);
        }

        updateCounter();
        updateHelper();      // mostra/oculta o helper conforme o campo
        msgEl.addEventListener('input', () => {
            updateCounter();
            updateHelper();
            updateButtonState();
        }, { passive: true });
    }


    // Feedback acessível
    if (feedbackDiv) {
        feedbackDiv.setAttribute('role', 'status');
        feedbackDiv.setAttribute('aria-live', 'polite');
    }

    // Estado inicial do botão
    updateButtonState();

    // Validações contínuas
    if (emailEl) {
        emailEl.addEventListener('input', updateButtonState, { passive: true });
        emailEl.addEventListener('change', updateButtonState, { passive: true });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFeedback();

        const errors = validate();
        if (errors.length) {
            showFeedback('error', errors.join('\n'));
            return;
        }

        // validação remota de e-mail (Netlify Function)
        const emailVal = emailEl ? emailEl.value.trim() : "";
        try {
            const vres = await fetch("/.netlify/functions/validate-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailVal })
            });
            const vjson = await vres.json();

            if (!vjson.valid) {
                let msg = "E-mail inválido. Verifique o endereço e tente novamente.";
                if (vjson.reason === "disposable") msg = "E-mails descartáveis não são aceitos.";
                if (vjson.reason === "mx") msg = "O domínio do e-mail não possui registros MX válidos.";
                if (vjson.reason === "format") msg = "Formato de e-mail inválido.";
                if (vjson.reason === "empty") msg = "Informe um e-mail.";
                if (vjson.suggestion) msg += ` Você quis dizer: ${emailVal.split("@")[0]}@${vjson.suggestion}?`;
                showFeedback("error", msg);
                return; // não envia para Formspree
            }
        } catch (_) {
            // Em caso de falha da function, continue com a validação local (não travar o usuário)
        }


        const formData = new FormData(form);
        setLoadingState(true);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' } // mantém resposta JSON e evita redirect
            });

            if (response.ok) {
                try { await response.json(); } catch (_) { /* noop */ }
                showFeedback('success', 'Mensagem enviada com sucesso! Obrigado pelo contato Miau! 🐾');
                form.reset();
                updateCounter();
            } else {
                let errText = 'Houve um problema ao enviar. Tente novamente em instantes.';
                try {
                    const data = await response.json();
                    if (data && Array.isArray(data.errors)) {
                        errText = data.errors.map(e => e.message).join('\n'); // texto puro
                    }
                } catch (_) { /* noop */ }
                showFeedback('error', errText);
            }
        } catch (error) {
            console.error('[contactForm] erro no envio:', error);
            showFeedback('error', 'Oops! Não foi possível enviar agora, ou a mensagem contém caracteres inválidos. Tente novamente.');
        } finally {
            setLoadingState(false);
            updateButtonState();
        }
    });

    // ===== Helpers =====

    function updateCounter() {
        if (!msgEl || !counterEl) return;
        const used = (msgEl.value || '').length;
        counterEl.textContent = `${used}/${maxLen}`;
    }

    // Mostra o texto auxiliar somente enquanto a mensagem estiver vazia (após normalização estrita)
    function updateHelper() {
        if (!helperEl || !msgEl) return;
        const blank = isBlankStrict(msgEl.value); // já remove NBSP/zero-width, etc.
        helperEl.classList.toggle('hidden', !blank);
    }

    // Normaliza e testa "mensagem vazia" de forma estrita:
    // remove espaços padrão, quebras de linha, tabs, NBSP (\u00A0), zero-width (\u200B-\u200D, \uFEFF)
    function isBlankStrict(str) {
        if (str == null) return true;
        const normalized = String(str)
            .replace(/[\u00A0\u200B-\u200D\uFEFF]/g, ' ') // NBSP e zero-width => espaço normal
            .trim();
        // se depois de trim sobrou algo? se não, é “vazia”
        return normalized.length === 0;
    }

    function isValidEmail(v) {
        if (!v) return false;
        // Validação nativa primeiro
        if (emailEl && typeof emailEl.checkValidity === 'function') {
            if (!emailEl.checkValidity()) return false;
        }
        // Fallback simples
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    }

    function validate() {
        const errs = [];
        const emailVal = emailEl ? emailEl.value : '';
        const msgVal = msgEl ? msgEl.value : '';

        if (!emailEl) {
            errs.push('Campo de e-mail não encontrado.');
        } else if (!isValidEmail(emailVal)) {
            errs.push('Informe um e-mail válido.');
        }

        // Honeypot preenchido => bloqueia
        if (honeypot && honeypot.value && honeypot.value.trim().length > 0) {
            errs.push('Envio inválido.');
        }

        if (!msgEl) {
            errs.push('Campo de mensagem não encontrado.');
        } else if (isBlankStrict(msgVal)) {
            errs.push('A mensagem não pode estar vazia.');
        }

        return errs;
    }

    function setLoadingState(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        submitBtn.innerHTML = isLoading
            ? '<i class="fas fa-spinner fa-spin"></i> Enviando...'
            : 'Enviar Miaumensagem <i class="fas fa-paper-plane ml-2"></i>';
    }

    function clearFeedback() {
        if (feedbackDiv) feedbackDiv.innerHTML = '';
    }

    // Seguro contra XSS: cria DOM e usa textContent
    function showFeedback(type, message) {
        if (!feedbackDiv) return;
        const wrap = document.createElement('div');
        wrap.className =
            type === 'success'
                ? 'p-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                : 'p-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200';
        wrap.style.whiteSpace = 'pre-line';
        wrap.textContent = String(message);
        feedbackDiv.innerHTML = '';
        feedbackDiv.appendChild(wrap);
    }

    function updateButtonState() {
        if (!submitBtn) return;
        const okEmail = emailEl ? isValidEmail(emailEl.value) : false;
        const okMsg = msgEl ? !isBlankStrict(msgEl.value) : false;
        const canSend = okEmail && okMsg;
        submitBtn.disabled = !canSend;
        submitBtn.classList.toggle('opacity-50', !canSend);
        submitBtn.classList.toggle('cursor-not-allowed', !canSend);
    }

    function renderEmailSuggestion(emailOriginal, suggestedDomain) {
        if (!feedbackDiv || !emailEl) return;
        const local = emailOriginal.split("@")[0];
        const suggested = `${local}@${suggestedDomain}`;

        const box = document.createElement('div');
        box.className = 'p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';

        const text = document.createElement('span');
        text.textContent = 'Você quis dizer: ';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'underline font-semibold hover:no-underline';
        btn.textContent = suggested;
        btn.addEventListener('click', () => {
            emailEl.value = suggested;
            clearFeedback();
            emailEl.focus();
            updateButtonState();
        });

        const end = document.createElement('span');
        end.textContent = '?';

        box.append(text, btn, end);
        feedbackDiv.innerHTML = '';
        feedbackDiv.appendChild(box);
    }

}
