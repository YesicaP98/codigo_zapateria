// Validación de formularios
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateName(name) {
        return name.trim().length >= 2;
    }

    static validatePasswordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    }

    static showError(input, message) {
        // Remover error anterior
        this.removeError(input);
        
        // Agregar nuevo error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-danger mt-1 small';
        errorDiv.textContent = message;
        errorDiv.id = `${input.id}-error`;
        
        input.classList.add('is-invalid');
        input.parentNode.appendChild(errorDiv);
    }

    static removeError(input) {
        input.classList.remove('is-invalid');
        const existingError = document.getElementById(`${input.id}-error`);
        if (existingError) {
            existingError.remove();
        }
    }

    static validateForm(formData) {
        let isValid = true;
        const errors = {};

        if (formData.name && !this.validateName(formData.name)) {
            errors.name = 'El nombre debe tener al menos 2 caracteres';
            isValid = false;
        }

        if (!this.validateEmail(formData.email)) {
            errors.email = 'Email inválido';
            isValid = false;
        }

        if (!this.validatePassword(formData.password)) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
            isValid = false;
        }

        if (formData.confirmPassword && !this.validatePasswordsMatch(formData.password, formData.confirmPassword)) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
            isValid = false;
        }

        return { isValid, errors };
    }
}

// Inicializar validación en formularios
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const { isValid, errors } = FormValidator.validateForm({ email, password });
            
            if (isValid) {
                authService.login(email, password).then(result => {
                    if (result.success) {
                        window.location.href = '/';
                    } else {
                        alert('Error: ' + result.error);
                    }
                });
            } else {
                // Mostrar errores
                if (errors.email) FormValidator.showError(document.getElementById('email'), errors.email);
                if (errors.password) FormValidator.showError(document.getElementById('password'), errors.password);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            const { isValid, errors } = FormValidator.validateForm({ 
                name, email, password, confirmPassword 
            });
            
            if (isValid) {
                authService.register(name, email, password).then(result => {
                    if (result.success) {
                        window.location.href = '/';
                    } else {
                        alert('Error: ' + result.error);
                    }
                });
            } else {
                // Mostrar errores
                if (errors.name) FormValidator.showError(document.getElementById('name'), errors.name);
                if (errors.email) FormValidator.showError(document.getElementById('email'), errors.email);
                if (errors.password) FormValidator.showError(document.getElementById('password'), errors.password);
                if (errors.confirmPassword) FormValidator.showError(document.getElementById('confirmPassword'), errors.confirmPassword);
            }
        });
    }

    // Validación en tiempo real
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            const value = this.value;
            let isValid = true;

            switch (this.type) {
                case 'email':
                    isValid = FormValidator.validateEmail(value);
                    if (!isValid) FormValidator.showError(this, 'Email inválido');
                    else FormValidator.removeError(this);
                    break;
                case 'password':
                    if (this.id === 'password') {
                        isValid = FormValidator.validatePassword(value);
                        if (!isValid) FormValidator.showError(this, 'Mínimo 6 caracteres');
                        else FormValidator.removeError(this);
                    }
                    break;
            }
        });
    });
});