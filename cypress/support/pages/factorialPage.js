export class FactorialPage {
    open(url) {
        cy.visit(url);
    }

    submitCalculation () {
        cy.get('button[type="submit"]')
            .click();
    }

    clearForm() {
        cy.xpath("//*[@id='number']")
            .clear();
    }

    typeNumber(number) {
        cy.get('#number')
        .type(number);
    }

    checkResult(message) {
        cy.get('#resultDiv')
        .should('have.text', message);
    }
}

export const factorialPage = new FactorialPage();