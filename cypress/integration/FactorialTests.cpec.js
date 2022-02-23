/// <reference types="cypress"/>
import { factorialPage } from "../support/pages/factorialPage";

//Getting a random number
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomNumber = getRandomInt(0, 28);

//Calculat the factorial of randomNumber
function factorial(n) {
    let result = 1;
    while (n) {
        result *= n--;
    }
    return result;
}

//request data
const requestBody = {
    number: randomNumber,
};

const headersData = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
};

const requestData = {
    method: 'POST',
    url: '/factorial',
    body: requestBody,
    headers: headersData,
};

//Позитивные тесты
describe('Positiv tests', () => {
    it('Page loaded successfully', () => {
        factorialPage.open(`/`);
    });

    it(`Factorial random value ${randomNumber}`, () => {
        let number = randomNumber;
        factorialPage.open(`/`);
        factorialPage.clearForm();
        factorialPage.typeNumber(number);
        factorialPage.submitCalculation();
        factorialPage.checkResult(`The factorial of ${number} is: ${factorial(number)}`);
    });

 
    it('Factorial value of 0 (min)', () => {
        let number = 0;
        factorialPage.open(`/`);
        factorialPage.typeNumber(number);
        factorialPage.submitCalculation();
        factorialPage.checkResult(`The factorial of ${number} is: ${factorial(number)}`);
    });

    it('Factorial value of 989 (max)', () => {
        let number = 989;
        factorialPage.open(`/`);
        factorialPage.clearForm();
        factorialPage.typeNumber(number);
        factorialPage.submitCalculation();
        factorialPage.checkResult(`The factorial of ${number} is: ${factorial(number)}`);
    });

    it('Following a link "Terms and Conditions" and check URL', () => {
        factorialPage.open(`/`);
        cy.get('a')
            .eq(0)
            .should('have.attr', 'href', '/privacy')
            .click()
            .url()
            .should('eq', 'http://qainterview.pythonanywhere.com/privacy');
    });
    

    it('Following a link "Privacy" and check URL', () => {
        factorialPage.open(`/`);
        cy.xpath("//*[@href='/terms']")
            .should('have.attr', 'href', '/terms')
            .click()
            .url()
            .should('eq', 'http://qainterview.pythonanywhere.com/terms');
    });
});

//негативные тесты
describe('Negativ tests', () => {
    it('Factorial value larger than 989', () => {
        let number = 990;
        factorialPage.open(`/`);
        factorialPage.clearForm();
        factorialPage.typeNumber(number);
        factorialPage.submitCalculation();
    });

    it('Factorial negative value (-1)', () => {
        let number = '-1';
        factorialPage.open(`/`);
        factorialPage.clearForm();
        factorialPage.typeNumber(number);
        factorialPage.submitCalculation();
    });

    it('Factorial real value (5.5)', () => {
        let number = '5.5';
        factorialPage.open(`/`);
        factorialPage.clearForm();
        factorialPage.typeNumber(number);
        factorialPage.submitCalculation();
        factorialPage.checkResult('Please enter an integer');
    });

    it('Factorial of empty string', () => {
        factorialPage.open(`/`);
        factorialPage.clearForm();
        factorialPage.submitCalculation();
        factorialPage.checkResult('Please enter an integer');
    });

});

//фазинг
describe('Fuzz Testing', () => {

    it('Factorial of string (rus)', () => {
        factorialPage.open(`/`);
        factorialPage.clearForm();
        factorialPage.typeNumber('Русский язык');
        factorialPage.submitCalculation();
        factorialPage.checkResult('Please enter an integer');
    });

    it('Factorial of string (eng)', () => {
        factorialPage.open(`/`);
        factorialPage.clearForm();
        factorialPage.typeNumber('English');
        factorialPage.submitCalculation();
        factorialPage.checkResult('Please enter an integer');
    });

    it('Factorial of string (specChar)', () => {
        factorialPage.open(`/`);
        factorialPage.clearForm();
        factorialPage.typeNumber('!@#$%');
        factorialPage.submitCalculation();
        factorialPage.checkResult('Please enter an integer');
    });


});

//тестирование API
describe('Positive API tests', () => {
    it('Successful request', () => {
        cy.request(requestData)
            .then((response) => {
            expect(response).to.have.property('status').to.be.oneOf([200, 201, 202]);
        });
    });

    it('Status message is Ok', () => {
        cy.request(requestData)
            .then((response) => {
            expect(response).to.have.property('statusText').to.equal("OK");

        });
    });

    it('Response time is less than 1s', () => {
        cy.request(requestData)
            .then((response) => {
            expect(response).to.have.property('duration').to.be.below(1000);

        });
    });

    it('Body contains "Answer" string', () => {
        cy.request(requestData)
            .then((response) => {
            expect(response.body).to.have.property('answer');

        });
    });


    if (randomNumber < 25) {
        it('Factorial value of random number ' + randomNumber + ' in the response is equal to calculated', () => {
            cy.request(requestData)
                .its('body').should('contain', {
                answer: factorial(randomNumber)
            });
        });
    } else {
        it('Factorial value of random number ' + randomNumber + ' in the response is equal to calculated', () => {
            cy.request(requestData)
                .then((response) => {
                expect(response.body.answer.toExponential(12)).to.be.equal(factorial(randomNumber).toExponential(12));

            });
        });
    }

    it('Factorial value of 0 in the response is equal to calculated (min)', () => {
        cy.request({
            method: 'POST',
            url: '/factorial',
            body: { number: 0 },
            headers: headersData,
        }).its('body').should('contain', {
            answer: factorial(0)
        });
    });

    it('Factorial value of 170 in the response is equal to calculated (max)', () => {
        cy.request({
            method: 'POST',
            url: '/factorial',
            body: { number: 170 },
            headers: headersData,
        }).then((response) => {
            expect(response.body.answer.toExponential(12)).to.be.equal(factorial(170).toExponential(12));
        });
    });

    it('Factorial value of number larger than 170 in the response is infinity', () => {
        cy.request({
            method: 'POST',
            url: '/factorial',
            body: { number: 171 },
            headers: headersData,
        }).then((response) => {
            expect(response.body.answer).to.be.equal(null);
        });
    });

});

//негативные api тесты
describe('Negativ API tests', () => {
    it('Factorial value of number larger than 989 is not calculated (status code 500)', () => {
        cy.request({
            method: 'POST',
            url: '/factorial',
            failOnStatusCode: false,
            body: { number: 990 },
            headers: headersData,
        }).then((response) => {
            expect(response).to.have.property('status').to.be.equal(500);
        });
    });

    it('Factorial of real number is not calculated (status code 500)', () => {
        cy.request({
            method: 'POST',
            url: '/factorial',
            failOnStatusCode: false,
            body: { number: 5.5 },
            headers: headersData,
        }).then((response) => {
            expect(response).to.have.property('status').to.be.equal(500);
        });
    });

    it('Factorial of negative number is not calculated (status code 500)', () => {
        cy.request({
            method: 'POST',
            url: '/factorial',
            failOnStatusCode: false,
            body: { number: '-5' },
            headers: headersData,
        }).then((response) => {
            expect(response).to.have.property('status').to.be.equal(500);
        });
    });

    it('Factorial of string is not calculated (status code 500)', () => {
        cy.request({
            method: 'POST',
            url: '/factorial',
            failOnStatusCode: false,
            body: { number: 'wasdas' },
            headers: headersData,
        }).then((response) => {
            expect(response).to.have.property('status').to.be.equal(500);
        });
    });

    it('Factorial of empty string is not calculated (status code 500)', () => {
        cy.request({
            method: 'POST',
            url: '/factorial',
            failOnStatusCode: false,
            body: { number: null },
            headers: headersData,
        }).then((response) => {
            expect(response).to.have.property('status').to.be.equal(500);
        });
    });
});
