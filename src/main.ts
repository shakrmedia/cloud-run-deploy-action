import * as core from '@actions/core'
import * as github from '@actions/github'

import {createDeployment, createDeploymentStatus} from './deployment';
import {updateCloudRunService, getCloudRunUrl} from './cloudrun';

async function run(): Promise<void> {
  try {
    const token = core.getInput('github_token');
    const octokit = github.getOctokit(token);

    const deployment = await createDeployment(octokit);
    let url: string;

    try {
      await updateCloudRunService();
      url = await getCloudRunUrl();
    } catch (error) {
      await createDeploymentStatus(octokit, deployment.data.id, 'failure');
      throw error;
    }

    await createDeploymentStatus(octokit, deployment.data.id, 'success', url);
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
