import { NodeSSH } from "node-ssh";

export async function putRemoteFile(
	ssh: NodeSSH,
	remotePath: string,
	data: Buffer | string
): Promise<void> {
	return await new Promise<void>((resolve, reject) => {
		ssh.connection?.sftp((err, sftp) => {
			if (err) {
				reject(err);
			}
			sftp.writeFile(remotePath, data, {}, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	});
}
