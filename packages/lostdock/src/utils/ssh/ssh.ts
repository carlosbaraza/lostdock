import { NodeSSH } from "node-ssh";
import { config } from "../../config";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import { createLogPreviewStream } from "./log-preview";
import chalk from "chalk";

export async function getSshClient() {
  const ssh = new NodeSSH();
  await ssh.connect({
    host: config().ssh.host,
    username: config().ssh.user,
    privateKey: readFileSync(config().ssh.privateKeyPath).toString(),
  });
  return ssh;
}

export async function enableRemoteRsaKey({
  privateKeyPath,
  user,
  host,
}: {
  privateKeyPath: string;
  user: string;
  host: string;
}) {
  // Using standard ssh cli as a child process, connect to the remote server
  // and enable the rsa key wirh PubkeyAcceptedKeyTypes=+ssh-rsa in the sshd_config
  // at /etc/ssh/sshd_config, only if the it is not already enabled. Then restart the sshd service.
  execSync(
    "ssh -i " +
      privateKeyPath +
      " " +
      user +
      "@" +
      host +
      ' \'if ! grep -q "PubkeyAcceptedKeyTypes=+ssh-rsa" /etc/ssh/sshd_config; then echo "PubkeyAcceptedKeyTypes=+ssh-rsa" | sudo tee -a /etc/ssh/sshd_config; sudo service sshd restart; fi\'',
    {
      stdio: "inherit",
    }
  );
}

export async function exec(
  ssh: NodeSSH,
  command: string,
  options: {
    cwd?: string;
    verbose?: boolean;
    log?: (log: string | null) => void;
    exitOnError?: boolean;
  } = {}
) {
  const defaults = {
    cwd: config().server.homePath,
    verbose: config().verbose,
    exitOnError: true,
  };
  const { cwd, verbose, log, exitOnError } = { ...defaults, ...options };
  const { logStream } = createLogPreviewStream(log);
  if (verbose) {
    console.log(chalk.gray(`Executing command: ` + command));
  }
  const response = await ssh.execCommand(
    `${verbose ? "set -x" : ""}
export DEBIAN_FRONTEND=noninteractive
${command}`,
    {
      cwd,
      onStdout: (chunk) => {
        logStream.push(chunk);
        if (verbose) {
          console.log(chalk.gray(chunk));
        }
      },
      onStderr: (chunk) => {
        logStream.push(chunk);
        if (verbose) {
          console.log(chalk.red(chunk));
        }
      },
      execOptions: {
        pty: true,
      },
      stdin: process.stdin,
    }
  );
  log?.(null);

  if (exitOnError && response.code !== 0) {
    console.error(chalk.red(`Command "${command}" failed with exit code: ` + response.code));
    console.error(chalk.red(response.stdout));
    console.error(chalk.red(response.stderr));
    process.exit(response.code || 1);
  }

  return response;
}

//   // Local, Remote
//   ssh.putFile('/home/steel/Lab/localPath/fileName', '/home/steel/Lab/remotePath/fileName').then(function() {
//     console.log("The File thing is done")
//   }, function(error) {
//     console.log("Something's wrong")
//     console.log(error)
//   })

//   // Array<Shape('local' => string, 'remote' => string)>
//   ssh.putFiles([{ local: '/home/steel/Lab/localPath/fileName', remote: '/home/steel/Lab/remotePath/fileName' }]).then(function() {
//     console.log("The File thing is done")
//   }, function(error) {
//     console.log("Something's wrong")
//     console.log(error)
//   })

//   // Local, Remote
//   ssh.getFile('/home/steel/Lab/localPath', '/home/steel/Lab/remotePath').then(function(Contents) {
//     console.log("The File's contents were successfully downloaded")
//   }, function(error) {
//     console.log("Something's wrong")
//     console.log(error)
//   })

//   // Putting entire directories
//   const failed = []
//   const successful = []
//   ssh.putDirectory('/home/steel/Lab', '/home/steel/Lab', {
//     recursive: true,
//     concurrency: 10,
//     // ^ WARNING: Not all servers support high concurrency
//     // try a bunch of values and see what works on your server
//     validate: function(itemPath) {
//       const baseName = path.basename(itemPath)
//       return baseName.substr(0, 1) !== '.' && // do not allow dot files
//              baseName !== 'node_modules' // do not allow node_modules
//     },
//     tick: function(localPath, remotePath, error) {
//       if (error) {
//         failed.push(localPath)
//       } else {
//         successful.push(localPath)
//       }
//     }
//   }).then(function(status) {
//     console.log('the directory transfer was', status ? 'successful' : 'unsuccessful')
//     console.log('failed transfers', failed.join(', '))
//     console.log('successful transfers', successful.join(', '))
//   })

//   // Command
//   ssh.execCommand('hh_client --json', { cwd:'/var/www' }).then(function(result) {
//     console.log('STDOUT: ' + result.stdout)
//     console.log('STDERR: ' + result.stderr)
//   })

//   // Command with escaped params
//   ssh.exec('hh_client', ['--json'], { cwd: '/var/www', stream: 'stdout', options: { pty: true } }).then(function(result) {
//     console.log('STDOUT: ' + result)
//   })

//   // With streaming stdout/stderr callbacks
//   ssh.exec('hh_client', ['--json'], {
//     cwd: '/var/www',
//     onStdout(chunk) {
//       console.log('stdoutChunk', chunk.toString('utf8'))
//     },
//     onStderr(chunk) {
//       console.log('stderrChunk', chunk.toString('utf8'))
//     },
//   })
