import sys
import requests
import json

xfm0_url = 'http://server:8080'


def call_post(s, url, payload):
	r = s.post(url, data=json.dumps(payload))
	print r.status_code, '::', r.text


def call_put(s, url, payload):
	r = s.put(url, data=json.dumps(payload))
	print r.status_code, '::', r.text


def call_get(s, url):
	r = s.get(url)
	print r.status_code, '::', r.text

def get_proc_nodes(s, url):
	return s.get(url + '/process_node')

def get_job_template(s, url, experiment_name):
	result = s.get(url + '/get_job_dict?experiment_name=' + experiment_name)
	if result.status_code == 200:
		return json.loads(result.text)
	else:
		print 'Error getting job dictionary'
		return {}

def update_mapspy_job(job_dict, DataPath, proc_options, proc_per_line=11, proc_per_file=2, detector_elements=4, dataset_filenames='all', detector_to_start_with=0, pn_id =-1, priority=5, is_live_job=0, quickNdirty=0, nnls=0, xanes=0, xrfbin=0, emails=''):
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

	job_dict['BeamLine'] = '2-ID-E'
	job_dict['DataPath'] = DataPath
	job_dict['Version'] = '9.00'
	job_dict['Emails'] = emails
	job_dict['DatasetFilesToProc'] = dataset_filenames
	job_dict['Args'] = {
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


if __name__ == '__main__':
	#if len(sys.argv) < 3:
		# 1 or 0 for a - f options
	#	print 'python submit_job.py job_path <a,b,c,d,e,f> '
	#	sys.exit(1)
	session = requests.Session()
	#job_path = sys.argv[1]
	#proc_options = sys.argv[2].split(',')
	#print job_path, proc_options
	url = xfm0_url + '/job'
	job_dict = get_job_template(session, xfm0_url, 'MapsPy')
	#update_mapspy_job(job_dict, DataPath=job_path, proc_options=proc_options)
	for key,val in job_dict.iteritems():
		print key, val
	#print job_dict
	#call_post(session, url, job_dict)
	print ' '
	#job_dict = get_job_template(session, xfm0_url, 'PtychoLib')
	#print job_dict

