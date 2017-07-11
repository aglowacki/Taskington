import Constants
import os
import glob
import sys
import h5py
import StringIO
from PIL import Image
import numpy as np
import binascii

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


def gen_email_attachments(alias_path, job_dict):
	images_dict = None
	try:
		# create image dictionary
		images_dict = {}
		full_file_name = ''
		# check how many datasets are in job
		file_name = ''
		file_dir = os.path.join(alias_path, Constants.DIR_IMG_DAT)
		job_args = job_dict[Constants.JOB_ARGS]
		proc_mask = job_args[JOB_PROC_MASK]
		# will only check one file for images
		if job_dict[Constants.JOB_DATASET_FILES_TO_PROC] == 'all':
			#self.logger.warning('Warning: Too many datasets to parse images from')
			return None
		else:
			temp_names = job_dict[Constants.JOB_DATASET_FILES_TO_PROC].split(',')
			if len(temp_names) > 1:
				#self.logger.warning('Warning: Can only parse one dataset for images, dataset list is %s', job_dict[Constants.JOB_DATASET_FILES_TO_PROC])
				return None
			temp_name = job_dict[Constants.JOB_DATASET_FILES_TO_PROC]

			hdf_file_name = temp_name.replace('.mda', '.h5')
			full_file_name = os.path.join(file_dir, hdf_file_name)

		hdf_file = h5py.File(full_file_name, 'r')
		maps_group = hdf_file[Constants.HDF5_GRP_MAPS]

		if proc_mask & 4 == 4:
			xrf_dataset = np.nan_to_num(maps_group[Constants.HDF5_DSET_XRF_FITS])
		elif proc_mask & 1 == 1:
			xrf_dataset = np.nan_to_num(maps_group[Constants.HDF5_DSET_XRF_ROI])
		else:
			#self.logger.warning('Warning: %s did not process XRF_ROI or XRF_FITS', file_name)
			return None
		channel_names = maps_group[Constants.HDF5_GRP_CHANNEL_NAMES]

		if channel_names.shape[0] != xrf_dataset.shape[0]:
			#self.logger.warning('Warning: file %s : Datasets: %s [%s] and %s [%s] length missmatch', file_name, Constants.HDF5_DSET_XRF_ROI, xrf_dataset.shape[0], Constants.HDF5_GRP_CHANNEL_NAMES, channel_names.shape[0])
			return None

		for i in range(channel_names.size):
			outbuf = StringIO.StringIO()
			I8 = (((xrf_dataset[i] - np.min(xrf_dataset[i])) / (np.max(xrf_dataset[i]) - np.min(xrf_dataset[i]))) * 255.9).astype(np.uint8)
			img = Image.fromarray(I8,  mode='L')
			img.save(outbuf, format='JPEG')
			name = 'channel_' + channel_names[i] + '.jpg'
			images_dict[name] = binascii.b2a_base64(outbuf.getvalue())
	except:
		images_dict = None
	return images_dict


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