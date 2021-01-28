import * as core from '@actions/core'
import * as github from '@actions/github'

import {createDeployment, createDeploymentStatus} from './deployment'
import {updateCloudRunService, getCloudRunUrl} from './cloudrun'

async function run(): Promise<void> {
  try {
    const token = core.getInput('github_token')
    const octokit = github.getOctokit(token)

    const deploymentId = await createDeployment(octokit)
    core.setOutput('deployment_id', deploymentId)

    let url: string

    try {
      await updateCloudRunService()
      url = await getCloudRunUrl()
    } catch (error) {
      await createDeploymentStatus(octokit, deploymentId, 'failure')
      throw error
    }

    await createDeploymentStatus(octokit, deploymentId, 'success', url)
    core.setOutput('url', url)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
