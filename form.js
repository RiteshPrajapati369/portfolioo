const name=document.getElementById("name");
const email=document.getElementById("email");
const message=document.getElementById("message");
const POST_URL= "https://formspree.io/f/mnnvvelg"
const button=document.getElementById("submit-button");

button.addEventListener("click", async (e) => {
    e.preventDefault();
    button.disabled = true;
    button.textContent = "Sending...";

    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("email", email.value);
    formData.append("message", message.value);

    try {
        const response = await fetch(POST_URL, {
            method: "POST",
            body: formData,
            headers: {
                Accept: "application/json"
            }
        });

        if (response.ok) {
            alert("Message sent successfully!");
            contactForm.reset();
        } else {
            alert("There was an error sending your message. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("There was an error sending your message. Please try again.");
    } finally {
        button.disabled = false;
        button.textContent = "Send Message";
    }
});