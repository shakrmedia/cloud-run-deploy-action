import * as core from '@actions/core'
import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'

type DeploymentState =
  | 'error'
  | 'failure'
  | 'inactive'
  | 'in_progress'
  | 'queued'
  | 'pending'
  | 'success'

export async function createDeployment(octokit: InstanceType<typeof GitHub>) {
  return octokit.repos.createDeployment({
    ...github.context.repo,
    ref: core.getInput('ref'),
    required_contexts: [],
    environment: core.getInput('github_environment'),
    mediaType: {previews: ['ant-man']}
  })
}

export async function createDeploymentStatus(
  octokit: InstanceType<typeof GitHub>,
  deployment_id: number,
  state: DeploymentState,
  environment_url?: string
) {
  return octokit.repos.createDeploymentStatus({
    ...github.context.repo,
    deployment_id,
    state,
    environment_url,
    mediaType: {previews: ['ant-man']}
  })
}
