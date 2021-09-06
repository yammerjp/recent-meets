/*
type Room = {
  id: string;
  name?: string;
  lastAccessUnixTimeMs: number;
}
*/

function appendBar(rooms) {
  const alreadyExistsElement = document.getElementById('recent-meets-container')
  if (alreadyExistsElement) {
    alreadyExistsElement.remove()
  }

  const header = document.querySelector('header');
  if (!header) {
    return
  }

  const container = document.createElement('div');
  container.id = 'recent-meets-container'
  const firstInnerContainer = document.createElement('div')
  firstInnerContainer.id = 'recent-meets-first-inner-container'
  container.appendChild(firstInnerContainer)
  firstInnerContainer.innerHTML = '<span>Recent Meets:</span>';

  rooms.forEach(room => {
    const innerContainer = document.createElement('div');
    innerContainer.classList.add('recent-meets-inner-container')
    const anker = document.createElement('a')
    anker.href = `https://meet.google.com/${room.id}`;
    anker.innerText = !room.name ? room.id : room.name
    innerContainer.appendChild(anker)
    const button = document.createElement('button')
    button.innerText = '🖋'
    button.addEventListener('click', () => {
      editName(room.id, room.name)
    });
    button.classList.add('recent-meets-edit-name-button')
    innerContainer.appendChild(button)
    container.appendChild(innerContainer);

  })

  header.appendChild(container);
}

function editName(id, name) {
  if (!this.time || Date.now() - this.time < 500) {
    this.time = Date.now()
    return
  }
  this.time = Date.now()

  console.log(`${id}: ${name}`)

  const newName = prompt('ルームにつける名前を入力 (idのままにするには空)', name)
  if (!newName) {
    localStorage.removeItem(`recent-meets:${id}`)
  } else {
    localStorage.setItem(`recent-meets:${id}`, newName)
  }

  main()
}

async function loadRooms() {
  const json = await sendMessage('')
  const urlsIncludeMeet = JSON.parse(json)
  const roomUrlsAllowDuplicating = urlsIncludeMeet.filter(u => /^https:\/\/meet\.google\.com\/[0-9a-z\-]+$/.test(u))
  const roomUrls = Array.from(new Set(roomUrlsAllowDuplicating))
  const rooms = roomUrls.map(createRoomFromUrl)
  return rooms
}

function createRoomFromUrl(url) {
  if (!/^https:\/\/meet\.google\.com\/[0-9a-z\-]+$/.test(url)) {
    throw new Error('invalid room id format')
  }
  const id = url.split('/')[3]
  const name = localStorage.getItem(`recent-meets:${id}`)
  if (!name) {
    return {id}
  }
  return { id, name }
}

function sendMessage(message) {
  return new Promise((resolve, reject) =>{
    chrome.runtime.sendMessage(message, (res) => resolve(res))
  })
}

async function main() {

  /*
  const room1 = {
    id: 'hello-world-1',
    name: 'hello-world-room-name-1',
  }

  const room2 = {
    id: 'hello-world-2',
    name: 'hello-world-room-name-2',
  }

  appendBar([room1, room2])
  */

  const rooms = await loadRooms()
  if (rooms.length < 5) {
    appendBar(rooms)
    return
  }
  const first3 = rooms.slice(0, 3)
  const others = rooms.slice(5)
  const namedOthers = others.filter(r => r.name)
  appendBar([...first3, ...namedOthers])
}

if ((location.href).split('#')[0].split('?')[0] === 'https://meet.google.com/') {
  main().then(() => {
    console.log('Recent meets is loaded.')
  })
}
