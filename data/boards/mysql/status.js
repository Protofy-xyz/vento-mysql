const result = await fetch("http://localhost:8000/api/v1/mysql/alive")
const data = await result.json()
if (data.is_error) {
    return "unreachable"
}

return "Pong!"