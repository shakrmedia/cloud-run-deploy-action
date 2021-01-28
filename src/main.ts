import * as core from '@actions/core'
import * as github from '@actions/github'

import {createDeployment, createDeploymentStatus} from './deployment'
import {updateCloudRunService, getCloudRunUrl} from './cloudrun'

async function run(): Promise<void> {
  try {
    const token = core.getInput('github_token')
    const octokit = github.getOctokit(token)

    core.startGroup('Create GitHub Deployment')
    const deploymentId = await createDeployment(octokit)
    core.setOutput('deployment_id', deploymentId)
    core.endGroup()

    let url: string

    try {
      core.startGroup('Update Cloud Run Service')
      await updateCloudRunService()
      core.endGroup()

      core.startGroup('Get Cloud Run URL')
      url = await getCloudRunUrl()
      core.endGroup()
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
