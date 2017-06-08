import Constants
import subprocess
import traceback
import os
import glob
import numpy as np
import scipy.constants as spc
import h5py
from ptycholib_helper import readMDA
from PIL import Image
import scipy.ndimage as spn

# ARGS KEYS
STR_CalcSTXM = 'CalcSTXM'
STR_AlgorithmEPIE = 'AlgorithmEPIE'
STR_AlgorithmDM = 'AlgorithmDM'
STR_DetectorDistance = 'DetectorDistance'
STR_PixelSize = 'PixelSize'
STR_CenterY = 'CenterY'
STR_CenterX = 'CenterX'
STR_DiffractionSize = 'DiffractionSize'
STR_Rotation = 'Rotation'
STR_GPU_ID = 'GPU_ID'
STR_ProbeSize = 'ProbeSize'
STR_ProbeModes = 'ProbeModes'
STR_Threshold = 'Threshold'
STR_Iterations = 'Iterations'


STR_STXM_PV = 'p300K:Stats1:Total_RBV'
STR_HDPC_PV = 'p300K:Stats1:CentroidX_RBV'
STR_VDPC_PV = 'p300K:Stats1:CentroidY_RBV'

def opencsv(stringname):
	ob = np.genfromtxt(stringname, delimiter=',', dtype=complex)
	return ob

def grayimage(img):
	img -= img.min()
	im = Image.fromarray(img)
	return im

def create_dest_dirs(dirname, log_file):
	#dirname = os.path.join(dst_dir, subdir)
	if not os.path.exists(dirname):
		os.makedirs(dirname, mode=0777)
		log_file.write('Creating directory:' + dirname + '\r\n')

def read_h5(filename):
	h5_file_path = 'entry/instrument/detector/data'
	h5_open = h5py.File(filename,'r')
	data = h5_open[h5_file_path].value
	h5_open.close()
	return data

def energy_to_wavelength(energy):
	"""
	Converts an energy in keV to wavelength in metres.
	"""
	wl = spc.physical_constants['Planck constant'][0]
	wl *= spc.speed_of_light
	wl /= (energy*1e3*spc.elementary_charge)
	return wl


def get_data_by_name(arr, name):
	for i in range(len(arr)):
		if arr[i].name == name:
			return np.array(arr[i].data)
	return None


def calc_stxm_dpc(file_path, scanDimY, scanDimX, log_file, fs=1):
	l=[]
	com=[]
	for i in range(fs,fs + scanDimY):
		data = read_h5(file_path.format(i))
		log_file.write('Processing Line {:d}/{:d}\r\n'.format(i-fs+1, scanDimY))
		for j in range(scanDimX):
			l.append(np.sum(data[j]))
			com.append(spn.center_of_mass(data[j]))
	stxm=np.array(l,float).reshape([scanDimY, scanDimX])
	dpc=np.array(com).reshape((scanDimY, scanDimX,2))
	stxm_dpc=[]
	stxm_dpc.append(stxm)
	stxm_dpc.append(dpc[:,:,0])
	stxm_dpc.append(dpc[:,:,1])
	return stxm_dpc


def gen_args_dict():
	return {
		STR_AlgorithmEPIE:1,
		STR_AlgorithmDM:0,
		STR_CenterY:0,
		STR_CenterX:0,
		STR_ProbeModes:5,
		STR_Iterations:200,
		STR_Rotation:1,
		STR_Threshold:1,
		STR_ProbeSize:1,
		STR_PixelSize:172,
		STR_DiffractionSize: 128,
		STR_DetectorDistance: 1.2,
		STR_GPU_ID:0,
		STR_CalcSTXM:1
	}


def start_job(log_name, alias_path, job_dict, options, exitcode):
	job_args = job_dict[Constants.JOB_ARGS]
	try:
		if job_dict[Constants.JOB_DATASET_FILES_TO_PROC] == 'all':
			job_dict[Constants.JOB_DATASET_FILES_TO_PROC] = glob.glob(alias_path + '/mda/*.mda')
		path = options['Path']
		exe = options['Exe']
		log_file = open('job_logs/' + log_name, 'w')
		i=0
		for mda_full_path in job_dict[Constants.JOB_DATASET_FILES_TO_PROC]:
			i += 1
			try:
				mda_file_name = os.path.basename(mda_full_path)
				args = [exe]
				mda_data = readMDA.readMDA(fname=mda_full_path, maxdim=2, verbose=0, help=0, new=0)
				if len(mda_data) != 3:
					log_file.write('ERROR: Could not read file: '+mda_file_name+'\r\n')
					continue
				os.system('export CUDA_VISIBLE_DEVICES='+str(job_args[STR_GPU_ID])) # 0, 3: k40; 1,2,4: k20
				STXM = get_data_by_name(mda_data[2].d, STR_STXM_PV)
				HDPC = get_data_by_name(mda_data[2].d, STR_HDPC_PV)
				VDPC = get_data_by_name(mda_data[2].d, STR_VDPC_PV)
				fs = 1
				blind = 0
				scanDimY,scanDimX=STXM.shape[0]-fs+1,STXM.shape[1]
				qy,qx = VDPC.mean(),HDPC.mean()
				#Getting scan step size
				ypos = np.array(mda_data[1].p[0].data)
				xpos = np.array(mda_data[2].p[0].data)
				stepY = (ypos.max()-ypos.min())/(scanDimY-0)*1000 #nm
				stepX = (xpos[0,:].max()-xpos[0,:].min())/(scanDimX-1)*1000 #nm
				#Getting X-ray energy
				energy = mda_data[1].d[0].data[0]
				wavelength = energy_to_wavelength(energy)*1.e9 #nm
				base_name = mda_file_name.split('.mda')[0]
				base_name_list = base_name.split('_')
				prefix = base_name_list[0]
				scanNo = int(base_name_list[1])
				job_id='{:s}_{:.3f}keV_scan{:03d}_p{:d}_s{:d}_ts{:d}_i{:d}'.format(prefix, energy, scanNo, job_args[STR_ProbeModes], job_args[STR_DiffractionSize], job_args[STR_Threshold], job_args[STR_Iterations]) #file saved name
				#fp = alias_path + '/ptycho/' + job_id + '_h5'
				fp=os.path.join(alias_path,'ptycho3/scan{:03d}/Velo_scan{:03d}_#06d.h5'.format(scanNo,scanNo)) #diffraction pattern path
				if int(job_args[STR_CalcSTXM])==1: #Calculate STXM_DPC
					log_file.write('Calculating STXM_DPC: {:d}/{:d}\r\n'.format(i,len(job_dict[Constants.JOB_DATASET_FILES_TO_PROC])))
					dpc_path=os.path.join(alias_path,'STXM_DPC')
					create_dest_dirs(dpc_path, log_file)
					diff_path=fp.split('#')[0]+'{:06d}.h5'
					STXM_DPC = calc_stxm_dpc(diff_path, scanDimY, scanDimX, log_file)
					im=Image.fromarray(STXM_DPC[0])
					im.save(dpc_path+'/'+'scan{:03d}'.format(scanNo)+'_STXM.tif')
					im=Image.fromarray(STXM_DPC[1])
					im.save(dpc_path+'/'+'scan{:03d}'.format(scanNo)+'_VDPC.tif')
					im=Image.fromarray(STXM_DPC[2])
					im.save(dpc_path+'/'+'scan{:03d}'.format(scanNo)+'_HDPC.tif')
					log_file.write('Saving STXM_DPC to:' + dpc_path + '\r\n')
				else: #Ptychography reconstruction
					args += ['-jobID=', job_id]
					args += ['-blind=', blind]
					args += ['-fp=', fp]
					args += ['-fs=', fs]
					args += ['-beamSize=', job_args[STR_ProbeSize]]
					args += ['-qxy=', qy + ',' + qx]
					args += ['-scanDims=', scanDimY + ',' + scanDimX]
					args += ['-step=', stepY + ',' + stepX]
					args += ['-probeModes=', job_args[STR_ProbeModes]]
					args += ['-i=', job_args[STR_Iterations]]
					args += ['-rotate90=', job_args[STR_Rotation]]
					args += ['-sqrtData']
					args += ['-ffShiftData']
					args += ['-threshold=', job_args[STR_Threshold]]
					args += ['-size=', job_args[STR_DiffractionSize]]
					args += ['-lambda=', wavelength]
					args += ['-dx_d=', job_args[STR_PixelSize]]
					args += ['-z=', job_args[STR_DetectorDistance]]
					args += ['-dpf=', scanDimX]
					exitcode = subprocess.call(args, cwd=path, stdout=log_file, stderr=log_file, shell=False)
					print 'exitcode = ', exitcode
			except:
				exc_str = traceback.format_exc()
				print exc_str
				log_file.write(exc_str)
				exitcode = -1
		log_file.close()
	except:
		exc_str = traceback.format_exc()
		print exc_str
		exitcode = -1


if __name__ == '__main__':
	#  test module
	log_name = 'test_ptycholib_module.log'
	alias_path = '/data/ptycho_apr17/'
	job_dict = {Constants.JOB_DATASET_FILES_TO_PROC: 'all',
				Constants.JOB_ARGS: gen_args_dict()
				}
	options = {'Path': '/bin/',
			   'Exe': 'ls'}
	exitcode = 0
	start_job(log_name, alias_path, job_dict, options, exitcode)
	print 'Done'