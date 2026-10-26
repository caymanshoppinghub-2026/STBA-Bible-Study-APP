/**
 * Minimal test harness to verify the Elder Stephen discipleship endpoint.
 */
export async function testElderStephenEndpoint() {
  const payload = {
    noteContent: "Test message",
    userAction: "test"
  };

  console.log("Sending payload to Elder Stephen endpoint:", payload);

  try {
    const response = await fetch('/api/elder-stephen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Success! Elder Stephen Responded:", data);
    return data;
  } catch (error) {
    console.error("Endpoint verification failed:", error);
    throw error;
  }
}
