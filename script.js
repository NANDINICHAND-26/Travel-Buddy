const apiKey = ''; // Move this to server-side for security

async function fetchWithRetry(url, options, retries = 3, backoff = 3000) {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options);
        
        if (response.status === 429) {
            console.warn("Too many requests. Waiting to retry...");
            const retryAfter = response.headers.get('Retry-After') || backoff;
            await new Promise(resolve => setTimeout(resolve, retryAfter)); // Wait before retrying
        } else if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        } else {
            return response.json();
        }
    }
    throw new Error('Max retries reached. Please try again later.');
}

// Use the fetchWithRetry function
document.getElementById('generateBtn').addEventListener('click', async () => {
    const destination = document.getElementById('destination').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    if (!destination || !fromDate || !toDate) {
        alert("Please fill out all fields.");
        return;
    }

    const travelStyles = [];
    if (document.getElementById('chillExplorer').checked) travelStyles.push('Chill Explorer');
    if (document.getElementById('adventureSeeker').checked) travelStyles.push('Adrenaline Junkie');
    if (document.getElementById('cultureVulture').checked) travelStyles.push('Culture Vulture');
    if (document.getElementById('foodieOnTheMove').checked) travelStyles.push('Foodie on the Move');
    if (document.getElementById('allRounder').checked) travelStyles.push('Action-Packed All-Rounder');

    const userMessage = `I want a travel itinerary for ${destination} from ${fromDate} to ${toDate}. My preferred travel styles are: ${travelStyles.join(', ')}.`;

    const responseContainer = document.getElementById('responseContainer');
    responseContainer.innerHTML = 'Generating itinerary...'; 

    try {
        const data = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [
                    { role: "user", content: userMessage }
                ],
                max_tokens: 500
            })
        });

        const itinerary = data.choices[0].message.content;
        responseContainer.innerHTML = itinerary;

    } catch (error) {
        console.error("Error:", error);
        responseContainer.innerHTML = `Sorry, something went wrong: ${error.message}. Please try again.`;
    }
});