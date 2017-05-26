import sys
import requests
import json

xfm0_url = ''


def call_post(s, url, payload):
	r = s.post(url, data=json.dumps(payload))
	print r.status_code, '::', r.text


def call_put(s, url, payload):
	r = s.put(url, data=json.dumps(payload))
	print r.status_code, '::', r.text


def call_get(s, url):
	r = s.get(url)
	print r.status_code, '::', r.text

def gen_job_template():
	job = {	'Experiment': '',
			'DataPath': '',
			'Version': '1.00',
			'BeamLine': 'a',
			'DatasetFilesToProc': 'all',
			'Priority': 5,
			'Status': 0,
			'StartProcTime': 0,
			'FinishProcTime': 0,
			'Log_Path': '',
			'Process_Node_Id': -1,
			'Emails': '',
			'Args': {}
			}
	return job

def gen_mapspy_job(DataPath, proc_options, proc_per_line=11, proc_per_file=2, detector_elements=4, dataset_filenames='all', detector_to_start_with=0, pn_id =-1, priority=5, is_live_job=0, quickNdirty=0, nnls=0, xanes=0, xrfbin=0, emails=''):
	analysis_type_a = int(proc_options[0])
	analysis_type_b = int(proc_options[1])
	analysis_type_c = int(proc_options[2])
	analysis_type_d = int(proc_options[3])
	analysis_type_e = int(proc_options[4])
	analysis_type_f = int(proc_options[5])
	procMask = 0
	if analysis_type_a > 0:
		procMask += 1
	if analysis_type_b > 0:
		procMask += 2
	if analysis_type_c > 0:
		procMask += 4
	if analysis_type_d > 0:
		procMask += 8
	if analysis_type_e > 0:
		procMask += 16
	if analysis_type_f > 0:
		procMask += 32

	job = gen_job_template()
	job['Experiment'] = 'MapsPy'
	job['BeamLine'] = '2-ID-E'
	job['DataPath'] = DataPath
	job['Version'] = '9.00'
	job['Emails'] = emails
	job['DatasetFilesToProc'] = dataset_filenames
	job['Args'] = {
					'ProcMask': procMask,
					'Standards': 'maps_standardinfo.txt',
					'DetectorToStartWith': 0,
					'XRF_Bin': 0,
					'MaxLinesToProc': proc_per_line,
					'MaxFilesToProc': proc_per_file,
					'DetectorElements': detector_elements,
					'XANES_Scan': xanes,
					'NNLS': nnls,
					'QuickAndDirty': quickNdirty,
					'Is_Live_Job': is_live_job,
					}

	return job



if __name__ == '__main__':
	if len(sys.argv) < 3:
		# 1 or 0 for a - f options
		print 'python submit_job.py job_path <a,b,c,d,e,f> '
		sys.exit(1)
	job_path = sys.argv[1]
	proc_options = sys.argv[2].split(',')
	print job_path, proc_options
	url = xfm0_url + '/job'
	payload = gen_mapspy_job(DataPath=job_path, proc_options=proc_options)
	session = requests.Session()
	print payload
	call_post(session, url, payload)
