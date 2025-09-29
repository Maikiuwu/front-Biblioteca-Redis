export async function login(datos){
  const response = await fetch('http://localhost:3000/biblioteca/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos),
    datos: 'include'
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return await response.json();
}