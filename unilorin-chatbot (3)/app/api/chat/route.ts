export const maxDuration = 30

// Fallback responses for when the custom API fails
const FALLBACK_RESPONSES = [
  "Hi! I'm UNILORIN Student Support. I can help you with course registration, academic calendar, GPA calculations, and general university guidance. What would you like to know?",
  "As your UNILORIN academic assistant, I can help you with course-related queries, registration procedures, examination schedules, and campus resources. How can I assist you today?",
  "I'm designed to support UNILORIN students with academic guidance. Whether you need help with course selection, understanding university policies, or navigating campus resources, I'm here to help!",
]

function getRandomFallbackResponse(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
}

function generateContextualResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()

  if (message.includes("register") || message.includes("registration")) {
    return `For course registration at UNILORIN:

1. **Prerequisites**: Ensure you've completed your course selection for the semester
2. **Access Portal**: Log into the student portal with your student ID and password
3. **Navigate**: Go to the course registration section
4. **Select Courses**: Choose your courses carefully, checking for prerequisites and restrictions
5. **Confirm**: Review your selections and submit your registration
6. **Confirmation**: Save your confirmation email for your records

**Important**: Complete registration early to secure your preferred courses. Contact the registrar's office if you encounter any issues.`
  }

  if (message.includes("gpa") || message.includes("result") || message.includes("grade")) {
    return `To check your GPA and results at UNILORIN:

1. **Student Portal**: Log into your student portal account
2. **Academic Records**: Navigate to the academic records or results section
3. **Select Semester**: Choose the semester you want to view
4. **View Results**: Your grades and GPA will be displayed

**GPA Calculation**: UNILORIN uses a 5.0 scale where A=5, B=4, C=3, D=2, F=0. Your CGPA is the cumulative average of all completed courses.

For official transcripts or grade disputes, contact the academic office.`
  }

  if (message.includes("calendar") || message.includes("date") || message.includes("deadline")) {
    return `Important UNILORIN Academic Calendar Information:

**Key Periods to Remember**:
- Course registration typically opens at the beginning of each semester
- Add/Drop period usually lasts 2 weeks after registration
- Mid-semester exams occur around week 7-8
- Final exams are scheduled at the end of each semester

**Important Deadlines**:
- School fees payment deadlines
- Course registration deadlines
- Examination registration deadlines

**Recommendation**: Check the official UNILORIN academic calendar on the university website for exact dates, as they may vary by semester and academic year.`
  }

  return getRandomFallbackResponse()
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Please provide a valid message to get started.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage?.content || ""

    try {
      // Call the custom UNILORIN RAG API
      const response = await fetch("https://lilsher-rag.onrender.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          // Add any other parameters the API might expect
        }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const responseData = await response.text()

      // Return the response from the custom API
      return new Response(responseData, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "X-Custom-API": "true",
        },
      })
    } catch (apiError) {
      console.error("Custom API Error:", apiError)

      // Fallback to contextual response
      const fallbackResponse = generateContextualResponse(userMessage)

      return new Response(fallbackResponse, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "X-Fallback": "true",
        },
      })
    }
  } catch (error) {
    console.error("General API Error:", error)

    return new Response(
      "Hi! I'm UNILORIN Student Support. I can help you with course registration, academic calendar, GPA calculations, and general university guidance. What would you like to know?",
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "X-Fallback": "true",
        },
      },
    )
  }
}
