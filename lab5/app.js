class ProcrastinationApplication {
    constructor(name, email, level, bestTime, comment, agree) {
        this.name = name;
        this.email = email;
        this.level = level;
        this.bestTime = bestTime;
        this.comment = comment;
        this.agree = agree;
        this.createdAt = new Date();
    }

    printToConsole() {
        console.group('Новая анкета Министерства Прокрастинации');
        console.log('Имя:', this.name);
        console.log('E-mail:', this.email);
        console.log('Уровень прокрастинации:', this.level || 'не указан');
        console.log('Пиковое время откладывания:', this.bestTime || 'не указано');
        console.log('Комментарий:', this.comment || 'нет');
        console.log('Согласие на обработку данных:', this.agree ? 'получено' : 'нет');
        console.log('Время отправки:', this.createdAt.toLocaleString());
        console.groupEnd();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // ====================== 1. ДИНАМИЧЕСКАЯ ПРОВЕРКА ФОРМЫ ======================
    const form = document.getElementById('join-form');
    if (form) {
        initFormValidation();
        initFormSubmission();
    }

    // ====================== 2. АСИНХРОННАЯ ЗАГРУЗКА РАСПИСАНИЯ ======================
    const scheduleBody = document.getElementById('schedule-body');
    if (scheduleBody) {
        loadScheduleData();
        // Запускаем периодическое обновление каждые 5 минут (300000 мс)
        setInterval(loadScheduleData, 300000);
    }
});

// ====================== ФУНКЦИИ ДЛЯ ВАЛИДАЦИИ ФОРМЫ ======================
function initFormValidation() {
    const form = document.getElementById('join-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const agreeCheckbox = document.getElementById('agree');

    // Создаем элементы для отображения ошибок
    createErrorElements();

    // Валидация в реальном времени
    nameInput.addEventListener('input', validateName);
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('input', validateEmail);
    emailInput.addEventListener('blur', validateEmail);
    agreeCheckbox.addEventListener('change', validateAgreement);

    // Валидация всех полей при отправке
    form.addEventListener('submit', validateAllFields);
}

function createErrorElements() {
    const fields = [
        { id: 'name', message: 'Имя должно содержать минимум 2 символа' },
        { id: 'email', message: 'Введите корректный email' },
        { id: 'agree', message: 'Необходимо согласие на обработку данных' }
    ];

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            errorSpan.id = `${field.id}-error`;
            errorSpan.style.display = 'none';
            errorSpan.style.color = '#f87171';
            errorSpan.style.fontSize = '0.85rem';
            errorSpan.style.marginTop = '4px';
            errorSpan.textContent = field.message;

            // Для checkbox вставляем после label
            if (field.id === 'agree') {
                const label = input.nextElementSibling;
                label.parentNode.insertBefore(errorSpan, label.nextSibling);
            } else {
                input.parentNode.appendChild(errorSpan);
            }
        }
    });
}

function validateName() {
    const nameInput = document.getElementById('name');
    const errorSpan = document.getElementById('name-error');
    const name = nameInput.value.trim();

    if (name.length < 2) {
        showError(nameInput, errorSpan, 'Имя должно содержать минимум 2 символа');
        return false;
    } else {
        hideError(nameInput, errorSpan);
        return true;
    }
}

function validateEmail() {
    const emailInput = document.getElementById('email');
    const errorSpan = document.getElementById('email-error');
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        showError(emailInput, errorSpan, 'Введите корректный email (например: user@example.com)');
        return false;
    } else {
        hideError(emailInput, errorSpan);
        return true;
    }
}

function validateAgreement() {
    const agreeCheckbox = document.getElementById('agree');
    const errorSpan = document.getElementById('agree-error');

    if (!agreeCheckbox.checked) {
        showError(agreeCheckbox, errorSpan, 'Необходимо согласие на обработку данных');
        return false;
    } else {
        hideError(agreeCheckbox, errorSpan);
        return true;
    }
}

function validateAllFields(event) {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isAgreementValid = validateAgreement();

    if (!(isNameValid && isEmailValid && isAgreementValid)) {
        event.preventDefault();
        showFormMessage('Пожалуйста, исправьте ошибки в форме', 'error');
        return false;
    }
    return true;
}

function showError(input, errorSpan, message) {
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
    input.style.borderColor = '#f87171';
    input.style.boxShadow = '0 0 0 3px rgba(248, 113, 113, 0.1)';
}

function hideError(input, errorSpan) {
    errorSpan.style.display = 'none';
    input.style.borderColor = '';
    input.style.boxShadow = '';
}

// ====================== ФУНКЦИИ ДЛЯ ОТПРАВКИ ФОРМЫ НА СЕРВЕР ======================
function initFormSubmission() {
    const form = document.getElementById('join-form');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Проверяем валидность
        if (!validateAllFields(event)) {
            return;
        }

        const formData = new FormData(form);

        const application = new ProcrastinationApplication(
            (formData.get('name') || '').trim(),
            (formData.get('email') || '').trim(),
            formData.get('level') || '',
            formData.get('bestTime') || '',
            (formData.get('comment') || '').trim(),
            form.elements.agree.checked
        );

        application.printToConsole();

        try {
            // Отправляем POST-запрос на сервер
            showFormMessage('Отправка данных...', 'info');

            const response = await fetch('http://localhost:3000/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(application)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Данные успешно отправлены на сервер:', result);

            showFormMessage('Анкета успешно отправлена! Мы свяжемся с вами... когда-нибудь.', 'success');
            form.reset();

            // Очищаем сообщение через 5 секунд
            setTimeout(() => {
                const messageDiv = document.getElementById('form-message');
                if (messageDiv) {
                    messageDiv.style.display = 'none';
                }
            }, 5000);

        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            showFormMessage('Ошибка при отправке. Попробуйте позже или прокрастинируйте отправку.', 'error');
        }
    });
}

function showFormMessage(message, type) {
    let messageDiv = document.getElementById('form-message');

    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'form-message';
        messageDiv.style.marginTop = '16px';
        messageDiv.style.padding = '12px';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.fontWeight = '500';

        const form = document.getElementById('join-form');
        form.appendChild(messageDiv);
    }

    messageDiv.textContent = message;
    messageDiv.style.display = 'block';

    if (type === 'success') {
        messageDiv.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        messageDiv.style.border = '1px solid rgba(34, 197, 94, 0.3)';
        messageDiv.style.color = '#22c55e';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = 'rgba(248, 113, 113, 0.1)';
        messageDiv.style.border = '1px solid rgba(248, 113, 113, 0.3)';
        messageDiv.style.color = '#f87171';
    } else {
        messageDiv.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
        messageDiv.style.border = '1px solid rgba(245, 158, 11, 0.3)';
        messageDiv.style.color = '#f59e0b';
    }
}

// ====================== ФУНКЦИИ ДЛЯ ЗАГРУЗКИ РАСПИСАНИЯ ======================
async function loadScheduleData() {
    const scheduleBody = document.getElementById('schedule-body');
    const errorDiv = document.getElementById('schedule-error');
    const loadingDiv = document.getElementById('schedule-loading');
    const table = document.querySelector('.plan');

    if (!scheduleBody) return;

    try {
        // Убираем предыдущие сообщения об ошибках
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }

        // Показываем индикатор загрузки, скрываем таблицу
        if (loadingDiv) {
            loadingDiv.style.display = 'block';
        }
        if (table) {
            table.style.display = 'none';
        }

        // Выполняем GET-запрос к серверу
        const response = await fetch('http://localhost:3000/schedule');

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const scheduleData = await response.json();

        // Проверяем, что данные получены
        if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
            throw new Error('Расписание пусто или данные в неверном формате');
        }

        // Очищаем текущее содержимое таблицы
        scheduleBody.innerHTML = '';

        // Заполняем таблицу данными с сервера
        scheduleData.forEach(item => {
            const row = document.createElement('tr');

            const timeCell = document.createElement('td');
            timeCell.textContent = item.time || '';

            const activityCell = document.createElement('td');
            activityCell.textContent = item.activity || '';

            row.appendChild(timeCell);
            row.appendChild(activityCell);
            scheduleBody.appendChild(row);
        });

        // Скрываем индикатор загрузки и показываем таблицу
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        if (table) {
            table.style.display = 'table';
        }

        // Показываем сообщение об успешной загрузке
        showScheduleMessage('Расписание загружено', 'success');

    } catch (error) {
        console.error('Ошибка при загрузке расписания:', error);

        // Показываем сообщение об ошибке
        if (errorDiv) {
            errorDiv.textContent = `Не удалось загрузить расписание: ${error.message}`;
            errorDiv.style.display = 'block';
            errorDiv.style.color = '#f87171';
            errorDiv.style.margin = '10px 0';
            errorDiv.style.padding = '10px';
            errorDiv.style.backgroundColor = 'rgba(248, 113, 113, 0.1)';
            errorDiv.style.borderRadius = '8px';
        }

        // Скрываем индикатор загрузки
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }

        // В случае ошибки показываем статические данные как запасной вариант
        showFallbackSchedule();
    }
}

function showFallbackSchedule() {
    const scheduleBody = document.getElementById('schedule-body');
    const table = document.querySelector('.plan');

    if (!scheduleBody) return;

    // Статическое расписание на случай ошибки
    const fallbackSchedule = [
        { time: '13:00', activity: 'Проснуться' },
        { time: '13:05', activity: 'Покормить кота' },
        { time: '13:10 - 15:00', activity: 'Листать ленту в социальной сети' },
        { time: '15:00 - 16:00', activity: 'Утренний туалет' },
        { time: '16:00 - 17:00', activity: 'Поесть' },
        { time: '17:00 - 19:00', activity: 'Погулять' },
        { time: '19:00 - 20:00', activity: 'Полежать' },
        { time: '20:00 - 21:00', activity: 'Полистать ленту в социальной сети' },
        { time: '21:00 - 21:05', activity: 'Покормить кота' },
        { time: '21:10 - 22:00', activity: 'Поесть' },
        { time: '22:00 - 23:00', activity: 'Полежать' },
        { time: '23:00 - 23:30', activity: 'Поработать 👎 😩 💔' },
        { time: '23:30 - 04:00', activity: 'Смотреть сериалы' },
        { time: '04:00', activity: 'Лечь спать' }
    ];

    // Очищаем таблицу
    scheduleBody.innerHTML = '';

    // Заполняем таблицу статическими данными
    fallbackSchedule.forEach(item => {
        const row = document.createElement('tr');

        const timeCell = document.createElement('td');
        timeCell.textContent = item.time;

        const activityCell = document.createElement('td');
        activityCell.textContent = item.activity;

        row.appendChild(timeCell);
        row.appendChild(activityCell);
        scheduleBody.appendChild(row);
    });

    // Показываем таблицу
    if (table) {
        table.style.display = 'table';
    }
}

function showScheduleMessage(message, type) {
    let messageDiv = document.getElementById('schedule-message');

    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'schedule-message';
        messageDiv.style.margin = '10px 0';
        messageDiv.style.padding = '10px';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.fontSize = '0.9rem';

        const table = document.querySelector('.plan');
        if (table) {
            table.parentNode.insertBefore(messageDiv, table.nextSibling);
        }
    }

    messageDiv.textContent = message;

    if (type === 'success') {
        messageDiv.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        messageDiv.style.border = '1px solid rgba(34, 197, 94, 0.3)';
        messageDiv.style.color = '#22c55e';
    } else {
        messageDiv.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
        messageDiv.style.border = '1px solid rgba(245, 158, 11, 0.3)';
        messageDiv.style.color = '#f59e0b';
    }

    // Автоматически скрываем сообщение через 3 секунды
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}