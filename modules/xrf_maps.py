import Constants
import subprocess
import traceback
import os
import glob
import h5py
import StringIO
import scipy.misc
import binascii
import numpy as np
from PIL import Image


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
		#  create image dictionary
		images_dict = {}
		full_file_name = ''
		#  check how many datasets are in job
		file_name = ''
		file_dir = os.path.join(alias_path, Constants.DIR_IMG_DAT)
		job_args = job_dict[Constants.JOB_ARGS]
		proc_mask = job_args[JOB_PROC_MASK]
		# will only check one file for images
		if job_dict[Constants.JOB_DATASET_FILES_TO_PROC] == 'all':
			#logger.warning('Warning: Too many datasets to parse images from')
			return None
		else:
			temp_names = job_dict[Constants.JOB_DATASET_FILES_TO_PROC].split(',')
			if len(temp_names) > 1:
				return None
			temp_name = job_dict[Constants.JOB_DATASET_FILES_TO_PROC]
			if proc_mask & 64 == 64: #generate avg
				full_file_name = os.path.join(file_dir, temp_name + '.h5')
			else:
				full_file_name = os.path.join(file_dir, temp_name + '.h5' + str(job_args[JOB_DETECTOR_TO_START_WITH] ))

		hdf_file = h5py.File(full_file_name, 'r')
		maps_group = hdf_file[Constants.HDF5_GRP_MAPS]

		h5_grp = None
		analyzed_grp = maps_group[Constants.HDF5_GRP_ANALYZED]
		if analyzed_grp == None:
			#logger.warning('Warning: %s did not find '+Constants.HDF5_GRP_ANALYZED, file_name)
			return None
		if job_args[JOB_NNLS] == 1:
			h5_grp = analyzed_grp[Constants.HDF5_GRP_NNLS]
		elif proc_mask & 4 == 4:
			h5_grp = analyzed_grp[Constants.HDF5_GRP_FITS]
		elif proc_mask & 1 == 1:
			h5_grp = analyzed_grp[Constants.HDF5_GRP_ROI]
		else:
			#self.logger.warning('Warning: %s did not process XRF_ROI or XRF_FITS', file_name)
			return None
		if not h5_grp == None:
			xrf_dataset = np.nan_to_num(h5_grp[Constants.HDF5_DSET_COUNTS])
			channel_names = h5_grp[Constants.HDF5_DSET_CHANNELS]
		else:
			return None

		if channel_names.shape[0] != xrf_dataset.shape[0]:
			#logger.warning('Warning: file %s : Datasets: %s [%s] and %s [%s] length missmatch', file_name, Constants.HDF5_DSET_XRF_ROI, xrf_dataset.shape[0], Constants.HDF5_GRP_CHANNEL_NAMES, channel_names.shape[0])
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
		#default to version 9 layout 
		args += ['--add-v9layout']
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


