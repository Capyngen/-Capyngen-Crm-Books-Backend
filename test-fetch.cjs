async function test() {
  const res = await fetch('http://localhost:5000/api/v1/books/test/test-fiscal');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
