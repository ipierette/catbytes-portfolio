// js/modules/contactForm.js

export function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedbackDiv = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        setLoadingState(true);
        feedbackDiv.innerHTML = '';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showFeedback('success', 'Mensagem enviada com sucesso! Obrigado pelo contato, miau! 🐾');
                form.reset();
            } else {
                throw new Error('Houve um problema com a resposta do servidor Miau! Tente mais tarde.');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            showFeedback('error', 'Oops! Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente mais tarde ou me contate por outro meio.');
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        submitBtn.disabled = isLoading;
        submitBtn.innerHTML = isLoading
            ? '<i class="fas fa-spinner fa-spin"></i> Enviando...'
            : 'Enviar Miaumensagem <i class="fas fa-paper-plane ml-2"></i>';
    }

    function showFeedback(type, message) {
        feedbackDiv.innerHTML = `<p class="${type}">${message}</p>`;
    }
}