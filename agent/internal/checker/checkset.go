package checker

import (
	"time"
)

type CheckSet []*Check

func (cs *CheckSet) ResetLastRun(seconds int) {
	for idx, ck := range *cs {
		(*ck).lastRun = time.Now().Add(-time.Duration(idx%seconds) * time.Second)
	}
}
