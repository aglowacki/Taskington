TOP = .

.PHONY: support, public

default:

support:
	$(TOP)/sbin/install_nodejs.sh

public:
	$(TOP)/sbin/build_ngApp_to_public.sh
