async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/books/public-test/test-fiscal');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.log(e.message);
  }
}
run();
