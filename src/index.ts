#!/usr/bin/env node

import NumbersAPI, { NumbersAPIType } from 'wrapper-numbersapi'
import inquirer from 'inquirer'
import inquirerDatePickerPrompt from 'inquirer-datepicker-prompt'
import { createSpinner } from 'nanospinner'

inquirer.registerPrompt('datetime', inquirerDatePickerPrompt)

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms))

const askType = async (): Promise<string> => {
    const { type } = await inquirer.prompt({
        name: 'type',
        type: 'list',
        message: 'Select what kind of trivia you\'d like:',
        choices: [
            'number',
            'math',
            'year',
            'date',
        ]
    })
    return type
}

const askNumber = async (): Promise<number> => {
    const { num } = await inquirer.prompt({
        name: 'num',
        type: 'number',
        message: 'Enter Number to query:',
        default() {
            return 'random'
        }
    })
    return num
}

const askDate = async (): Promise<NumbersAPI["date"]> => {
    const { date } = await inquirer.prompt({
        //@ts-ignore
        type: 'datetime',
        name: 'date',
        message: 'Enter a date to query:',
        format: ['mm', '/', 'dd']
    })
    return `${("0" + (new Date(date).getUTCMonth() + 1)).slice(-2)}/${("0" + new Date(date).getUTCDate()).slice(-2)}`
}

const handleRequest = async (type: NumbersAPIType["types"], data: number | 'random' | NumbersAPIType["date"]): Promise<string> => {
    const nums = new NumbersAPI() 
    try {
        let response: string = ''
        switch(type){
            case 'number': 
                response = await nums.getNumberTrivia(data)
                break
            case 'math': 
                response = await nums.getMathTrivia(data)
                break
            case 'year':
                response = await nums.getYearTrivia(data)
                break
            case 'date': 
                response = await nums.getDateTrivia(data)
                break
        }
        return response
    } catch(error) {
        // console.log(error)
        throw error
    }
}

try {
    const type = await askType()

    let data: number | 'random' | NumbersAPIType["date"]
    if(type !== 'date') {
        data = await askNumber()
    } else {
        data = await askDate()
    }

    const spinner = createSpinner(`Fetching '${type}' trivia for '${data}'`).start();
    await sleep();
    const result = await handleRequest(type, data)

    if(result) {
        spinner.success({
            text: result
        })
        process.exit(0);
    } else {
        spinner.error({
            text: 'No Result Found'
        })
        process.exit(1)
    }
} catch(error) {
    console.log(error.message)
    process.exit(1)
}
