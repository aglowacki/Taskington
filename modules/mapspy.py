import Constants
import os
import glob
import sys


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
	#find_maps_batch()
	if not options['Path'] in sys.path:
		sys.path.insert(0,options['Path'])
	import maps_batch
	saved_cwd = os.getcwd()
	job_args = job_dict[Constants.JOB_ARGS]
	if job_args[JOB_IS_LIVE_JOB] == 1:
		dataset_full_file_path = max(glob.iglob(alias_path + '/mda/*.mda'), key=os.path.getctime)
		job_dict[Constants.JOB_DATASET_FILES_TO_PROC] = os.path.basename(dataset_full_file_path)
	#global _log_name
	#_log_name = log_name
	logger, fHandler = maps_batch.setup_logger('job_logs/' + log_name)
	logger.info('Start Job Process')
	try:
		os.chdir(options['Path'])
		maps_set_str = os.path.join(str(alias_path), 'maps_settings.txt')
		f = open(maps_set_str, 'w')
		f.write('	  This file will set some MAPS settings mostly to do with fitting' + '\n')
		f.write('VERSION:' + str(job_dict[Constants.JOB_VERSION]).strip() + '\n')
		f.write('DETECTOR_ELEMENTS:' + str(job_args[JOB_DETECTOR_ELEMENTS]).strip() + '\n')
		f.write('MAX_NUMBER_OF_FILES_TO_PROCESS:' + str(job_args[JOB_MAX_FILES_TO_PROC]).strip() + '\n')
		f.write('MAX_NUMBER_OF_LINES_TO_PROCESS:' + str(job_args[JOB_MAX_LINES_TO_PROC]).strip() + '\n')
		f.write('QUICK_DIRTY:' + str(job_args[JOB_QUICK_AND_DIRTY]).strip() + '\n')
		f.write('XRF_BIN:' + str(job_args[JOB_XRF_BIN]).strip() + '\n')
		f.write('NNLS:' + str(job_args[JOB_NNLS]).strip() + '\n')
		f.write('XANES_SCAN:' + str(job_args[JOB_XANES_SCAN]).strip() + '\n')
		f.write('DETECTOR_TO_START_WITH:' + str(job_args[JOB_DETECTOR_TO_START_WITH]).strip() + '\n')
		f.write('BEAMLINE:' + str(job_dict[Constants.JOB_BEAM_LINE]).strip() + '\n')
		f.write('DatasetFilesToProc:' + str(job_dict[Constants.JOB_DATASET_FILES_TO_PROC]).strip() + '\n')
		standard_filenames = job_args[JOB_STANDARDS].split(';')
		for item in standard_filenames:
			f.write('STANDARD:' + item.strip() + '\n')
		f.close()
		proc_mask = int(job_args[JOB_PROC_MASK])
		key_a = 0
		key_b = 0
		key_c = 0
		key_d = 0
		key_e = 0
		key_f = 0 # for netcdf to hdf5 future feature
		key_g = 0
		if proc_mask & 1 == 1:
			key_a = 1
		if proc_mask & 2 == 2:
			key_b = 1
		if proc_mask & 4 == 4:
			key_c = 1
		if proc_mask & 8 == 8:
			key_d = 1
		if proc_mask & 16 == 16:
			key_e = 1
		if proc_mask & 32 == 32:
			key_f = 1
		if proc_mask & 64 == 64:
			key_g = 1
		maps_batch.maps_batch(wdir=alias_path, option_a_roi_plus=key_a, option_b_extract_spectra=key_b, option_c_per_pixel=key_c, option_d_image_extract=key_d, option_e_exchange_format=key_e, option_g_avg_hdf=key_g, logger=logger)
		os.chdir(saved_cwd)
		logger.info('Completed Job')
	except:
		logger.exception('job process')
		os.chdir(saved_cwd)
		handlers = logger.handlers[:]
		for handler in handlers:
			handler.close()
			logger.removeHandler(handler)
		raise SystemError("Error Processing Dataset")
	logger.info('Done Job Process')
	handlers = logger.handlers[:]
	for handler in handlers:
		handler.close()
		logger.removeHandler(handler)
	return 0