const baseURL = "https://wa-c1rh.onrender.com/api/weather";

document.getElementById('weatherForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const location = document.getElementById('location').value;
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;

  const body = {
    location,
    dateRange: { from, to }
  };

  const res = await fetch(`${baseURL}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (res.ok) {
    alert('Weather saved!');
    fetchSaved();
  } else {
    alert(data.error || "Something went wrong");
  }
});

async function fetchSaved() {
  const res = await fetch(`${baseURL}/all`);
  const records = await res.json();

  const list = document.getElementById('savedList');
  list.innerHTML = '';

  records.forEach(record => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>${record.location}</strong> (${new Date(record.dateRange.from).toLocaleDateString()} - ${new Date(record.dateRange.to).toLocaleDateString()})
      <br>Temp: ${record.weatherData.main.temp} °C
      <br>
      <button onclick="deleteRecord('${record._id}')">Delete</button>
    `;
    list.appendChild(item);
  });
}

async function deleteRecord(id) {
  const res = await fetch(`${baseURL}/delete/${id}`, { method: 'DELETE' });
  const data = await res.json();

  if (res.ok) {
    alert('Deleted');
    fetchSaved();
  } else {
    alert(data.error || 'Delete failed');
  }
}

fetchSaved();
