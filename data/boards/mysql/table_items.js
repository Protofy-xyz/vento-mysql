const result = await fetch("http://localhost:8000/api/v1/mysql/tables/"+params.table+"?page="+params.page)
const data = await result.json()
return data.data