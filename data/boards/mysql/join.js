const result = await fetch("http://localhost:8000/api/v1/mysql/tables/join?page="+params.page, {
    method: "POST", 
    headers: {
        "content-type": "application/json"
    }, 
    body: JSON.stringify({ 
        table: params.table, 
        join_table: params.join_table, 
        field: params.field, 
        join_field: params.join_field, 
        field_value: params.field_value 
    })
})
const data = await result.json()
return data.data