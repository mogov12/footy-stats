import { useState } from 'react'

const FOOTBALL_KEY = import.meta.env.VITE_FOOTBALL_API_KEY
const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY

function App() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [analysing, setAnalysing] = useState(false)

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v4/matches?status=SCHEDULED', {
        headers: { 'X-Auth-Token': FOOTBALL_KEY }
      })
      const data = await res.json()
      setMatches(data.matches.slice(0, 20))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const analyseMatch = async (match) => {
    setSelected(match)
    setAnalysis('')
    setAnalysing(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': CLAUDE_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Analyse this football match for a bettor: ${match.homeTeam.name} vs ${match.awayTeam.name} in the ${match.competition.name} on ${new Date(match.utcDate).toLocaleDateString()}. 
            
Give a concise analysis covering:
1. General expectation for this fixture
2. Key factors to consider
3. Where the value might be in the betting markets

Keep it sharp and practical, 150 words max.`
          }]
        })
      })
      const data = await res.json()
      setAnalysis(data.content[0].text)
    } catch (e) {
      console.error(e)
      setAnalysis('Could not load analysis.')
    }
    setAnalysing(false)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', display: 'flex', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ marginBottom: '1rem' }}>Footy Stats</h1>
        <button onClick={fetchMatches} style={{ marginBottom: '1rem', padding: '8px 16px', cursor: 'pointer' }}>
          Load Matches
        </button>
        {loading && <p>Loading...</p>}
        {matches.map(m => (
          <div key={m.id} onClick={() => analyseMatch(m)}
            style={{ padding: '0.75rem 1rem', border: '1px solid #ddd', borderRadius: 8, marginBottom: 8, cursor: 'pointer',
              background: selected?.id === m.id ? '#f0f4ff' : 'white' }}>
            <strong>{m.homeTeam.name} vs {m.awayTeam.name}</strong>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{m.competition.name} · {new Date(m.utcDate).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        {selected && (
          <div style={{ padding: '1.5rem', background: '#f9f9f9', borderRadius: 12, position: 'sticky', top: '1rem' }}>
            <h2 style={{ fontSize: 18, marginBottom: '0.5rem' }}>{selected.homeTeam.name} vs {selected.awayTeam.name}</h2>
            <p style={{ fontSize: 13, color: '#666', marginBottom: '1rem' }}>{selected.competition.name} · {new Date(selected.utcDate).toLocaleDateString()}</p>
            <h3 style={{ fontSize: 14, marginBottom: '0.5rem' }}>AI Analysis</h3>
            {analysing ? <p style={{ color: '#888' }}>Analysing match...</p> : <p style={{ fontSize: 14, lineHeight: 1.6 }}>{analysis}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default App