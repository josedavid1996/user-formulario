// VARIABLES
const $d = document
const $templateTable = document.querySelector('.template-table').content
const $tabla = document.querySelector('.tabla')
const $fragment = document.createDocumentFragment()
const $form = $d.getElementById('form')
const $inputs = $d.querySelectorAll('form input')

// EXPRESIONES REGULARES
const expresiones = {
  text: /^[a-zA-ZÀ-ÿ\s]{1,40}$/,
  correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
}
// FUNCION PARA PINTAR LOS DATOS EN LA TABLA
const painData = (data) => {
  const $tds = $templateTable.querySelectorAll('tr td')
  data.forEach((item) => {
    $tds[0].textContent = item.id
    $tds[1].textContent = item.first_name
    $tds[2].textContent = item.last_name
    $tds[3].textContent = item.email

    const $clone = document.importNode($templateTable, true)
    $fragment.appendChild($clone)
  })
  $tabla.appendChild($fragment)
}

const getData = async () => {
  try {
    // LLAMADA A LA API
    const resp = await fetch('https://reqres.in/api/users?page=1')

    const obj = await resp.json()
    const data = obj.data

    // GUARDAR DATOS EN EL LOCALSTORAGE
    window.localStorage.setItem('data', JSON.stringify(data))
    // OBTENER DATOS EN EL LOCALSTORAGE
    const users = JSON.parse(window.localStorage.getItem('data'))
    console.log('user', users)

    // PINTAR LAS CELDAS DE LA TABLA
    painData(users)
  } catch (err) {
    const message = err.statusText || 'Ocurrió un error'
    $tabla.insertAdjacentHTML(
      'afterend',
      `<p><b>Error ${err.status}: ${message}</b></p>`
    )
  }
}

$d.addEventListener('DOMContentLoaded', getData)

// GRUPO DE DATOS PARA VALIDACION DE CAMPOS
let campos = {
  nombre: false,
  apellido: false,
  email: false,
  date: false
}

// VALIDACION DE LOS CAMPO

const validarCampo = (exp, input, campo) => {
  if (exp.test(input.value)) {
    $d.getElementById(campo).classList.add('border__correcto')
    $d.getElementById(campo).classList.remove('border__incorrecto')
    campos[campo] = true
  } else {
    $d.getElementById(campo).classList.add('border__incorrecto')
    $d.getElementById(campo).classList.remove('border__correcto')
    campos[campo] = false
  }
}
// VALIDACION DE LOS FORMULARIOS
const validarFormulario = (e) => {
  switch (e.target.name) {
    case 'nombre':
      validarCampo(expresiones.text, e.target, 'nombre')
      break
    case 'apellido':
      validarCampo(expresiones.text, e.target, 'apellido')
      break
    case 'email':
      validarCampo(expresiones.correo, e.target, 'email')
      break
    case 'date':
      if ($form.date.value) {
        campos.date = true
      } else {
        campos.date = false
      }
      break

    default:
      break
  }
}

$inputs.forEach((input) => {
  input.addEventListener('keyup', validarFormulario)
  input.addEventListener('blur', validarFormulario)
})

$form.addEventListener('submit', (e) => {
  e.preventDefault()

  if (campos.nombre && campos.apellido && campos.email && campos.date) {
    $d.querySelectorAll('.contenido__tabla').forEach((item) => {
      $tabla.removeChild(item)
    })
    // DATOS ENVIADOS A LOCALSTORAGE
    const updateUsers = JSON.parse(window.localStorage.getItem('data'))
    updateUsers.push({
      id: updateUsers.length + 1,
      email: $form.email.value,
      first_name: $form.nombre.value,
      last_name: $form.apellido.value,
      date: $form.date.value
    })
    window.localStorage.setItem('data', JSON.stringify(updateUsers))

    $form.reset()
    $d.querySelector('.form__incorrecto ').classList.remove('is_active')
    $d.querySelector('.form__correcto ').classList.add('is_active')
    setTimeout(() => {
      $d.querySelector('.form__correcto ').classList.remove('is_active')
    }, 5000)
    $d.querySelectorAll('.border__correcto').forEach((input) => {
      input.classList.remove('border__correcto')
      campos = {
        nombre: false,
        apellido: false,
        email: false,
        date: false
      }
    })
    painData(updateUsers)
  } else {
    $d.querySelector('.form__incorrecto ').classList.add('is_active')
  }
})
