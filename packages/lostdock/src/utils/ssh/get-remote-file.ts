import { NodeSSH } from "node-ssh";

export async function getRemoteFile(
	ssh: NodeSSH,
	remotePath: string
): Promise<string> {
	return await new Promise<string>((resolve, reject) => {
		ssh.connection?.sftp((err, sftp) => {
			if (err) {
				reject(err);
			}
			sftp.readFile(remotePath, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data.toString());
				}
			});
		});
	});
}
