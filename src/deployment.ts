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

export async function createDeployment(
  octokit: InstanceType<typeof GitHub>
): Promise<number> {
  const ref = process.env.GITHUB_HEAD_REF || github.context.ref

  const response = await octokit.repos.createDeployment({
    ...github.context.repo,
    ref,
    required_contexts: [],
    environment: core.getInput('github_environment'),
    mediaType: {previews: ['ant-man']}
  })

  return response.data.id
}

export async function createDeploymentStatus(
  octokit: InstanceType<typeof GitHub>,
  deployment_id: number,
  state: DeploymentState,
  environment_url?: string
): Promise<void> {
  await octokit.repos.createDeploymentStatus({
    ...github.context.repo,
    deployment_id,
    state,
    environment_url,
    mediaType: {previews: ['ant-man']}
  })
}
