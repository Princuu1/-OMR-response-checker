let candidateAnswers = [];

// Start by generating the questions for each section
function generateQuestions() {
    generateMcqQuestions('physicsMcqTable', 1, 20); // Physics MCQ: 1-20
    generateIntegerQuestions('physicsIntTable', 21, 25); // Physics Integer: 21-25
    
    generateMcqQuestions('chemistryMcqTable', 26, 45); // Chemistry MCQ: 26-45
    generateIntegerQuestions('chemistryIntTable', 46, 50); // Chemistry Integer: 46-50
    
    generateMcqQuestions('mathMcqTable', 51, 70); // Mathematics MCQ: 51-70
    generateIntegerQuestions('mathIntTable', 71, 75); // Mathematics Integer: 71-75
}

// Helper function to generate MCQ questions
function generateMcqQuestions(tableId, start, end) {
    const table = document.getElementById(tableId);
    for (let i = start; i <= end; i++) {
        const row = table.insertRow();
        row.insertCell(0).innerText = i;

        for (let j = 1; j <= 4; j++) {
            const cell = row.insertCell(j);
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `q${i}`;
            radio.value = String.fromCharCode(64 + j); // A, B, C, D
            cell.appendChild(radio);
            cell.appendChild(document.createTextNode(String.fromCharCode(64 + j))); // Label: A, B, C, D
        }
    }
}

// Helper function to generate Integer questions
function generateIntegerQuestions(tableId, start, end) {
    const table = document.getElementById(tableId);
    for (let i = start; i <= end; i++) {
        const row = table.insertRow();
        row.insertCell(0).innerText = i;

        const cell = row.insertCell(1);
        const intInput = document.createElement('input');
        intInput.type = 'number'; // Only allows numbers (integers)
        intInput.name = `int${i}`;
        intInput.placeholder = 'Integer Answer';
        intInput.min = '0'; // You can adjust the range based on the required input
        intInput.step = '1'; // Ensures only integers are allowed
        cell.appendChild(intInput);
    }
}

// Toggle section visibility (Physics MCQ, Physics Integer, etc.)
function toggleSection(sectionId) {
    document.querySelectorAll('.subject-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

// Function to handle OMR form submission and generate answer key form
function submitOMR() {
    candidateAnswers = []; // Reset candidate answers
    // Collect MCQ and Integer answers
    collectAnswers('physicsMcqTable', 1, 20);
    collectAnswers('physicsIntTable', 21, 25, true);
    
    collectAnswers('chemistryMcqTable', 26, 45);
    collectAnswers('chemistryIntTable', 46, 50, true);
    
    collectAnswers('mathMcqTable', 51, 70);
    collectAnswers('mathIntTable', 71, 75, true);

    document.getElementById('answerKeySheet').style.display = 'block'; // Show the answer key input
    generateAnswerKeyForm(); // Generate form to enter correct answers
}

// Helper function to collect candidate's answers
function collectAnswers(tableId, start, end, isInteger = false) {
    for (let i = start; i <= end; i++) {
        const answer = {};
        answer.question = i;
        if (isInteger) {
            answer.integerAnswer = document.querySelector(`input[name="int${i}"]`).value || null;
        } else {
            answer.answer = document.querySelector(`input[name="q${i}"]:checked`)?.value || null;
        }
        candidateAnswers.push(answer);
    }
}

// Function to generate the answer key input form
function generateAnswerKeyForm() {
    const form = document.getElementById('answerKeyForm');
    form.innerHTML = ''; // Clear previous form content

    candidateAnswers.forEach((candidateAnswer) => {
        const questionNumber = candidateAnswer.question;
        const label = document.createElement('label');
        label.innerText = `Q${questionNumber}: `;

        let input;
        if (questionNumber > 20 && questionNumber <= 25 ||
            questionNumber > 45 && questionNumber <= 50 ||
            questionNumber > 70 && questionNumber <= 75) {
            // Integer input for Integer-type questions
            input = document.createElement('input');
            input.type = 'number';
            input.name = `keyInt${questionNumber}`;
            input.placeholder = 'Correct Answer';
        } else {
            // Select input for MCQ-type questions
            input = document.createElement('select');
            input.name = `key${questionNumber}`;
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.text = 'Select Answer';
            input.appendChild(defaultOption);
            ['A', 'B', 'C', 'D'].forEach(optionValue => {
                const option = document.createElement('option');
                option.value = optionValue;
                option.text = optionValue;
                input.appendChild(option);
            });
        }

        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement('br'));
    });
}

// Submit the answer key and calculate score
function submitAnswerKey() {
    let correctCount = 0, wrongCount = 0, unattemptedCount = 0, score = 0;

    // Track if any question was attempted
    let anyAttempted = false;

    candidateAnswers.forEach((candidateAnswer) => {
        const questionNumber = candidateAnswer.question;
        let correctAnswer = null;

        if (questionNumber > 20 && questionNumber <= 25 ||
            questionNumber > 45 && questionNumber <= 50 ||
            questionNumber > 70 && questionNumber <= 75) {
            // Integer questions
            correctAnswer = document.querySelector(`input[name="keyInt${questionNumber}"]`).value;
        } else {
            // MCQ questions
            correctAnswer = document.querySelector(`select[name="key${questionNumber}"]`).value;
        }

        const candidateResponse = candidateAnswer.answer || candidateAnswer.integerAnswer;

        // Check if the question was attempted
        if (candidateResponse === null || candidateResponse === undefined || candidateResponse === '') {
            // Unattempted question
            unattemptedCount++; // Count unattempted questions but do not reduce marks
        } else {
            anyAttempted = true; // At least one question was attempted

            if (candidateResponse === correctAnswer) {
                correctCount++;
                score += 4; // +4 for correct answer
            } else {
                wrongCount++;
                score -= 1; // -1 for wrong answer
            }
        }
    });

    // If no questions were attempted, set score to 0
    if (!anyAttempted) {
        score = 0;
        correctCount = 0;
        wrongCount = 0;
        unattemptedCount = candidateAnswers.length; // All questions are unattempted
    }

    // Adjust for total score calculation
    if (score < 0) {
        score = 0; // Ensure score does not go negative
    }

    // Show the result popup with score details
    document.getElementById('scoreDetails').innerHTML = `
        Candidate Name: ${document.getElementById('candidateName').value}<br>
        Test No: ${document.getElementById('testNo').value}<br>
        Test Code: ${document.getElementById('testCode').value}<br>
        Batch Name: ${document.getElementById('batchName').value}<br><br>
        Correct Answers: ${correctCount} (+${correctCount * 4} Marks)<br>
        Wrong Answers: ${wrongCount} (-${wrongCount} Marks)<br>
        Unattempted: ${unattemptedCount}<br>
        Total Score: ${score} / 300<br><br>
    `;
    document.getElementById('resultPopup').style.display = 'block';
}

// Close the result popup
function closePopup() {
    document.getElementById('resultPopup').style.display = 'none';
}

// Generate the OMR form on page load
window.onload = generateQuestions;
