
const $ = (s) => document.querySelector(s);


const form = $('#trainer-form');
const nameInput = $('#trainer-name');
const emailInput = $('#trainer-email');
const dateInput = $('#trainer-start');
const formSection = $('#register-section');
const captureSection = $('#capture-section');
const pokeForm = $('#pokemon-form');
const resultDiv = $('#pokemon-result');
const teamList = $('#team-list');


function setInvalid(input, message) {
  input.classList.remove('valid');
  input.classList.add('invalid');
  input.nextElementSibling.textContent = message;
}

function setValid(input) {
  input.classList.remove('invalid');
  input.classList.add('valid');
  input.nextElementSibling.textContent = '';
}

function validateName() {
  if (nameInput.value.trim().length < 3) {
    setInvalid(nameInput, 'El nombre debe tener mínimo 3 caracteres');
    return false;
  }
  setValid(nameInput);
  return true;
}

function validateEmail() {
  const regex = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(emailInput.value)) {
    setInvalid(emailInput, 'Correo inválido');
    return false;
  }
  setValid(emailInput);
  return true;
}

function validateDate() {
  const today = new Date().toISOString().split('T')[0];
  if (dateInput.value < today) {
    setInvalid(dateInput, 'La fecha no puede ser anterior a hoy');
    return false;
  }
  setValid(dateInput);
  return true;
}


nameInput.addEventListener('input', validateName);
emailInput.addEventListener('input', validateEmail);
dateInput.addEventListener('input', validateDate);


form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validateName() | !validateEmail() | !validateDate()) return;

  const trainer = {
    id: Date.now(),
    trainerName: nameInput.value,
    email: emailInput.value,
    startDate: dateInput.value,
    equipo: []
  };

  localStorage.setItem('trainer', JSON.stringify(trainer));

  formSection.style.display = 'none';
  captureSection.style.display = 'block';

  renderTeam();
});


async function fetchPokemon(name) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) throw new Error();
    return response.json();
  } catch {
    return null;
  }
}


pokeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('#pokemon-input').value.toLowerCase();

  const data = await fetchPokemon(name);

  if (!data) {
    resultDiv.innerHTML = "<p style='color:red'>No se encontró el Pokémon</p>";
    return;
  }

  resultDiv.innerHTML = `
    <div class='pokemon-preview'>
      <img class='sprite' src="${data.sprites.front_default}">
      <span>${data.name}</span>
      <button id='add-btn'>Añadir al equipo</button>
    </div>
  `;

  $('#add-btn').addEventListener('click', () => addPokemon(data));
});


function addPokemon(poke) {
  const trainer = JSON.parse(localStorage.getItem('trainer'));

  trainer.equipo.push({
    id: poke.id,
    nombre: poke.name,
    sprite: poke.sprites.front_default,
    favorito: false
  });

  localStorage.setItem('trainer', JSON.stringify(trainer));
  renderTeam();
}


function renderTeam() {
  const trainer = JSON.parse(localStorage.getItem('trainer'));
  teamList.innerHTML = '';

  trainer.equipo.forEach((p) => {
    const li = document.createElement('li');
    li.classList.add('card');
    li.innerHTML = `
      <img class='sprite' src="${p.sprite}">
      <div class='meta'>
        <h4>${p.nombre}</h4>
      </div>
      <div class='controls'>
        <label>
          <input type='checkbox' ${p.favorito ? 'checked' : ''}> Favorito
        </label>
        <button class='del'>Liberar</button>
      </div>
    `;

    const chk = li.querySelector('input');
    const btn = li.querySelector('.del');

    chk.addEventListener('change', () => {
      p.favorito = chk.checked;
      localStorage.setItem('trainer', JSON.stringify(trainer));
    });

    btn.addEventListener('click', () => {
      trainer.equipo = trainer.equipo.filter(x => x.id !== p.id);
      localStorage.setItem('trainer', JSON.stringify(trainer));
      renderTeam();
    });

    teamList.appendChild(li);
  });
}


(function init() {
  const trainer = JSON.parse(localStorage.getItem('trainer'));
  if (trainer) {
    formSection.style.display = 'none';
    captureSection.style.display = 'block';
    renderTeam();
  }
})();