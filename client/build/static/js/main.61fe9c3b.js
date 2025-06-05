```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Story Craft</title>
    <link rel="stylesheet" href="styles.css">
    <script src="analytics.js" defer></script>
    <style>
        /* Modern CSS Reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
            color: #333;
        }

        .container {
            max-width: 800px;
            margin: auto;
            padding: 20px;
        }

        header {
            text-align: center;
            margin-bottom: 20px;
        }

        h1 {
            font-size: 2.5rem;
            color: #007BFF;
        }

        form {
            background: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .form-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }

        button {
            background-color: #007BFF;
            color: #fff;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #0056b3;
        }

        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .loading-spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid #007BFF;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error-message {
            color: red;
            margin: 10px 0;
        }

        footer {
            text-align: center;
            margin-top: 20px;
        }

        @media (max-width: 600px) {
            h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Story Craft</h1>
        </header>
        <main>
            <form id="storyForm">
                <div class="form-group">
                    <label for="childName">Child's Name:</label>
                    <input type="text" id="childName" name="childName" required placeholder="Enter your child's name">
                </div>
                <div class="form-group">
                    <label for="childAge">Child's Age:</label>
                    <input type="number" id="childAge" name="childAge" required min="1" max="12" placeholder="Enter your child's age">
                </div>
                <div class="form-group">
                    <label for="childInterest">Something They Like:</label>
                    <input type="text" id="childInterest" name="childInterest" required placeholder="e.g., dinosaurs, space, unicorns, soccer">
                </div>
                <button type="submit">Create Adventure!</button>
                <div class="loading" id="loading" style="display: none;">
                    <div class="loading-spinner"></div>
                </div>
                <div class="error-message" id="errorMessage"></div>
            </form>
        </main>
        <footer>
            <p>Created with ❤️ for young adventurers</p>
        </footer>
    </div>

    <script>
        const form = document.getElementById('storyForm');
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('errorMessage');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            loading.style.display = 'flex';
            errorMessage.textContent = '';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/stories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error('Failed to create story');
                }

                const result = await response.json();
                window.location.href = `/story/${result.storyId}`;
            } catch (error) {
                errorMessage.textContent = error.message || 'Something went wrong. Please try again.';
            } finally {
                loading.style.display = 'none';
            }
        });

        // Analytics Tracking
        let scrollDepth = 0;

        document.addEventListener('scroll', () => {
            const newScrollDepth = Math.ceil(window.scrollY / document.body.scrollHeight * 100);
            if (newScrollDepth !== scrollDepth) {
                scrollDepth = newScrollDepth;
                console.log(`Scroll Depth: ${scrollDepth}%`);
                // Send scroll depth to analytics
            }
        });

        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                console.log('Button Clicked:', button.innerText);
                // Send button click to analytics
            });
        });

        // Track time spent on page
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            console.log(`Time Spent on Page: ${timeSpent}s`);
            // Send time spent to analytics
        });
    </script>
</body>
</html>
```