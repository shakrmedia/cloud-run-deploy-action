import * as core from '@actions/core'
import * as exec from '@actions/exec'

function cloudRunDefaultArgs(): string[] {
  return [
    core.getInput('service_name'),
    `--project=${core.getInput('project_id')}`,
    `--region=${core.getInput('region')}`,
    '--platform=managed'
  ];
}

export async function updateCloudRunService(noTraffic = true): Promise<void> {
  await exec.exec('gcloud components install beta');

  let args = [
    'run', 'services', 'update',
    ...cloudRunDefaultArgs(),
    `--image=${core.getInput('image')}`
  ];

  const revision_tag = core.getInput('revision_tag');
  if (revision_tag !== '') {
    args.push(`--revision-tag=${revision_tag}`);
  }

  const revision_suffix = core.getInput('revision_suffix');
  if (revision_suffix !== '') {
    args.push(`--revision-suffix=${revision_suffix}`);
  }

  if (noTraffic === true) {
    args.push('--no-traffic');
  }

  const exitcode = await exec.exec('gcloud', ['beta', ...args]);
  if (exitcode !== 0) {
    throw 'Failed to update Cloud Run service';
  }
}

type TrafficItem = { [x: string]: string } & { tag: string, url: string};

export async function getCloudRunUrl(): Promise<string> {
  let args = [
    'run', 'services', 'describe',
    ...cloudRunDefaultArgs(),
    "--format=json"
  ];

  let stdout = '';
  const options = {
    listeners: { stdout: (data: Buffer) => { stdout += data.toString(); } }
  };
  const exitcode = await exec.exec('gcloud', ['beta', ...args], options);
  if (exitcode !== 0) {
    throw 'Failed to get Cloud Run URL';
  }

  let parsed = JSON.parse(stdout);

  // If revision tag is empty, return service default url
  // If revision tag is set, return revision tag url
  const revision_tag = core.getInput('revision_tag');
  if (revision_tag === '') {
    return parsed.status.url;
  } else {
    const trafficItems = parsed.status.traffic as TrafficItem[]; 
    return trafficItems.find(item => item.tag === revision_tag)?.url || '';
  }
}
