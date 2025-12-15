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
  var form = document.getElementById('join-form');
  if (!form) return; // На других страницах формы нет

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Чтобы страница не перезагружалась

    var formData = new FormData(form);

    var name = (formData.get('name') || '').trim();
    var email = (formData.get('email') || '').trim();
    var level = formData.get('level') || '';
    var bestTime = formData.get('bestTime') || '';
    var comment = (formData.get('comment') || '').trim();
    var agree = form.elements.agree.checked;

    var application = new ProcrastinationApplication(
      name,
      email,
      level,
      bestTime,
      comment,
      agree
    );

    application.printToConsole();

    // Можно имитировать "отправку" и сообщить пользователю
    alert('Данные отправлены! Посмотри в консоль браузера объект с анкетой.');

    form.reset();
  });
});
