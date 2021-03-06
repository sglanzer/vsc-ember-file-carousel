const fs = require('fs')
const path = require('path')

import { ExtensionContext, Uri, commands, window, workspace } from 'vscode'
import { resolve } from 'path'

import findNextModule from './find-next-module'

const { join } = path

const getNextModule = function (direction) {
  if (!window.activeTextEditor) {
    return
  }

  // Keep this around just in case we ever want to change the podModulePrefix dynamically
  // let { podModulePrefix } = require(`${workspace.rootPath}/config/environment.js`)()
  // const podModulePrefixTokens = podModulePrefix.split('/')
  // podModulePrefix = podModulePrefixTokens[podModulePrefixTokens.length - 1]

  const projectType = fs.existsSync(path.join(workspace.rootPath, 'addon')) ? 'addon' : 'app'
  const relativeFileName = workspace.asRelativePath(window.activeTextEditor.document.fileName)

  const nextModulePathInstance = findNextModule(workspace.rootPath, projectType, relativeFileName, direction)
  if (nextModulePathInstance) {
    const uri = Uri.parse(`file://${workspace.rootPath}/${nextModulePathInstance}`)
    workspace.openTextDocument(uri).then(document => {
      window.showTextDocument(document)
    })
  } else {
    window.setStatusBarMessage("Not an Ember module or no other files in this grouping", 2000)
  }
}

export function activate(context: ExtensionContext) {
  const next = commands.registerCommand('extension.emberFileCarouselNext', () => {
    getNextModule('next')
  })

  const previous = commands.registerCommand('extension.emberFileCarouselPrevious', () => {
    getNextModule('previous')
  })

  context.subscriptions.push(next)
  context.subscriptions.push(previous)
}
