// js/modules/contactForm.js

export function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedbackDiv = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        feedbackDiv.innerHTML = '';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                feedbackDiv.innerHTML = `<p class="success">Mensagem enviada com sucesso! Obrigado pelo contato, miau! 🐾</p>`;
                form.reset();
            } else {
                throw new Error('Houve um problema com a resposta do servidor.');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            feedbackDiv.innerHTML = `<p class="error">Oops! Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente mais tarde ou me contate por outro meio.</p>`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Enviar Miaumensagem <i class="fas fa-paper-plane ml-2"></i>';
        }
    });
}