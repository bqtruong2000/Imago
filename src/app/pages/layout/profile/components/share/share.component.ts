import { Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { TaigaModule } from '../../../../../shared/taiga.module';
import { ShareModule } from '../../../../../shared/share.module';
import { TuiDialogService } from '@taiga-ui/core';
import { Store } from '@ngrx/store';
import { AuthState } from '../../../../../../ngrx/auth/auth.state';
import { PostState } from '../../../../../../ngrx/post/post.state';
import { PostModel } from '../../../../../model/post.model';
import { Subscription, switchMap } from 'rxjs';
import * as PostActions from '../../../../../../ngrx/post/post.action';
@Component({
  selector: 'app-post',
  standalone: true,
  imports: [TaigaModule, ShareModule],
  templateUrl: './share.component.html',
  styleUrl: './share.component.scss',
})
export class ShareComponent implements OnInit, OnDestroy {
  shareList: PostModel[] = [];
  loader: boolean = false;
  subscription: Subscription[] = [];

  token$ = this.store.select('auth', 'token');
  shareList$ = this.store.select('post', 'list');
  loading$ = this.store.select('post', 'loading');
  success$ = this.store.select('post', 'isGetsucces');
  failure$ = this.store.select('post', 'error');

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private store: Store<{
      post: PostState;
      auth: AuthState;
    }>,
  ) { }

  ngOnInit(): void {
    this.subscription.push(
      this.token$.subscribe((token) => {
        if (token) {
          this.store.dispatch(PostActions.getByShareId({ page: 1, size: 10 }));
        }
      }),
      this.loading$.subscribe((res) => {
        if (res) {
          this.loader = true;
        }
      }),
      this.success$
        .pipe(
          switchMap((res) => {
            if (res) {
              return this.shareList$;
            }
            return [];
          }),
        )
        .subscribe((res) => {
          console.log('res', res.data);

          this.shareList = res.data;
          this.loader = false;
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}
