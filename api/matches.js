export default async function handler(req, res) {
  const response = await fetch('https://api.football-data.org/v4/matches?status=SCHEDULED', {
    headers: { 'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY }
  })
  const data = await response.json()
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.json(data)
}
