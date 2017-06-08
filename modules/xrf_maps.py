import Constants
import subprocess
import traceback
import os
import glob


# XRF JOB ARGS KEYS
JOB_IS_LIVE_JOB = 'Is_Live_Job'  # INTEGER
JOB_STANDARDS = 'Standards'  # TEXT
JOB_DETECTOR_ELEMENTS = 'DetectorElements'  # INTEGER
JOB_MAX_FILES_TO_PROC = 'MaxFilesToProc'  # INTEGER
JOB_MAX_LINES_TO_PROC = 'MaxLinesToProc'  # INTEGER
JOB_QUICK_AND_DIRTY = 'QuickAndDirty'  # INTEGER
JOB_XRF_BIN = 'XRF_Bin'  # INTEGER
JOB_NNLS = 'NNLS'  # INTEGER
JOB_XANES_SCAN = 'XANES_Scan'  # INTEGER
JOB_DETECTOR_TO_START_WITH = 'DetectorToStartWith'  # INTEGER
JOB_PROC_MASK = 'ProcMask'  # INTEGER


def gen_args_dict():
	return {
		JOB_IS_LIVE_JOB:0,
		JOB_STANDARDS:'maps_standardinfo.txt',
		JOB_DETECTOR_ELEMENTS:4,
		JOB_MAX_FILES_TO_PROC:1,
		JOB_MAX_LINES_TO_PROC:-1,
		JOB_QUICK_AND_DIRTY:0,
		JOB_XRF_BIN:0,
		JOB_NNLS:0,
		JOB_XANES_SCAN:0,
		JOB_DETECTOR_TO_START_WITH:0,
		JOB_PROC_MASK:0
	}


def start_job(log_name, alias_path, job_dict, options, exitcode):
	job_args = job_dict[Constants.JOB_ARGS]
	if job_args[JOB_IS_LIVE_JOB] == 1:
		dataset_full_file_path = max(glob.iglob(alias_path + '/mda/*.mda'), key=os.path.getctime)
		job_dict[Constants.JOB_DATASET_FILES_TO_PROC] = os.path.basename(dataset_full_file_path)
	try:
		xrf_maps_path = options['Path']
		xrf_maps_exe = options['Exe']
		args = [xrf_maps_exe]
		args += ['--dir', alias_path]
		if str(job_args[JOB_NNLS]).strip() == '1':
			args += ['--nnls']
		if str(job_args[JOB_QUICK_AND_DIRTY]).strip() == '1':
			args += ['--quick-and-dirty']
		mda_files = str(job_dict[Constants.JOB_DATASET_FILES_TO_PROC]).strip()
		if len (mda_files) > 0 and (not mda_files == 'all'):
			args += ['--files', mda_files]
		num_threads = str(job_args[JOB_MAX_LINES_TO_PROC]).strip()
		if not num_threads == '-1':
			args += ['--nthreads', num_threads]

		detector_start = int( str(job_args[JOB_DETECTOR_TO_START_WITH]).strip() )
		detector_amount = int( str(job_args[JOB_DETECTOR_ELEMENTS]).strip() )
		detector_end = detector_start + (detector_amount -1)

		if detector_start < 0 or detector_start > 3: # we only have 4 detectors
			detector_start = 0
		if detector_end < detector_start or detector_end > 3: # we only have 4 detectors
			detector_end = 3

		str_detector_range = str(detector_start) + ':' + str(detector_end)
		args += ['--detector-range', str_detector_range]

		if len(str(job_args[JOB_STANDARDS])) > 0:
			args += ['--quantify-with', str(job_args[JOB_STANDARDS])]

		proc_mask = int(job_args[JOB_PROC_MASK])
		key_d = 0
		key_f = 0 # for netcdf to hdf5 future feature
		if proc_mask & 1 == 1:
			args += ['--roi', '--roi_plus']
		if proc_mask & 2 == 2:
			args += ['--optimize-fit-override-params']
		if proc_mask & 4 == 4:
			args += ['--roi', '--roi_plus', '--matrix']
		if proc_mask & 8 == 8:
			key_d = 1
		if proc_mask & 16 == 16:
			args += ['--add-exchange']
		if proc_mask & 32 == 32:
			key_f = 1
		if proc_mask & 64 == 64:
			args += ['--generate-avg-h5']
		log_file = open('job_logs/' + log_name, 'w')
		print args
		if os.name == "nt":
			exitcode = subprocess.call(args, cwd=xrf_maps_path, stdout=log_file, stderr=log_file, shell=True)
		else:
			exitcode = subprocess.call(args, cwd=xrf_maps_path, stdout=log_file, stderr=log_file, shell=False)
		print 'exitcode = ', exitcode
		log_file.close()
	except:
		exc_str = traceback.format_exc()
		print exc_str
		exitcode = -1
