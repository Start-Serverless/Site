import { Stack, StackProps, SecretValue, CfnOutput }  from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
	App,
	CustomRule,
	GitHubSourceCodeProvider,
	RedirectStatus,
} from '@aws-cdk/aws-amplify-alpha'
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
	const siteApp = new  App(this, 'SiteApp', {
		sourceCodeProvider: new GitHubSourceCodeProvider({
			owner: "Start-Serverless",
			repository: "WebPage",
			oauthToken: SecretValue.secretsManager('github-amplify-token')
		}),
		environmentVariables: {
			region: this.region
		},
		buildSpec: BuildSpec.fromObjectToYaml({
				// Alternatively add a `amplify.yml` to the frontend repo
				version: 1,
				frontend: {
					phases: {
						preBuild: {
							commands: ['npm ci'],
						},
						build: {
							commands: ['npm run build'],
						},
					},
					artifacts: {
						baseDirectory: '/dist',
						files: ['**/*'],
					},
					cache: {
						paths: ['node_modules/**/*'],
					},
				},
			}),
	})   
  }
}
